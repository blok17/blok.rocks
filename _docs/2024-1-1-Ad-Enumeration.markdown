---
layout:     post
author:     0x5c4r3
type: docs
permalink: Ad_Enumeration
---

<span style="font-size: 35px; color:red"><b>Active Directory Enumeration</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Enumerate the forest</b></span>
```
nltest /trusted_domains
```
OR
```
([System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()).GetAllTrustRelationships()
```

OR with powerview:
```
Get-DomainTrust -API
```

OR
```
Get-DomainTrust
```

to Get details about the domain:
```
Get-DomainUser -Domain <domain>
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Enumerate Users</b></span>
Domain Users:
```powershell
net user /domain
```
Local Users:
```powershell
net user
```
<span style="color:red"><b>From Linux:</b></span>
Queries target domain for users and users data.
```shell
GetADUsers.py -all <DOMAIN>/<USER_NAME> -dc-ip <IP>
```

<span style="color:red"><b>From Windows:</b></span>
Prints the often-lengthy list of ACEs (<span style="color:red"><b>From Linux:</b></span>Access Control Entries</span>) applied to the object.
```powershell
Get-ObjectAcl -Identity <user>
```

To see usernames or group from SID:
```powershell
ConvertFrom-SID <SID_EXAMPLE_S-1-5-21-3776646582-2086779273-4091361643-553>
```
To do the same thing but for all SIDs dumped from _Get-ObjectAcl_:
```powershell
Get-ObjectAcl -Identity <user> -ResolveGUIDs | Foreach-Object {$_ | Add-Member -NotePropertyName Identity -NotePropertyValue (ConvertFrom-SID $_.SecurityIdentifier.value) -Force; $_}
```
(to get only the ones with GenericAll, add `| findstr -i "GenericAll ObjectDN"` at the ent of the block above)

To emunerate all ACEs for all domain users:
```powershell
Get-DomainUser | Get-ObjectAcl -ResolveGUIDs | Foreach-Object {$_ | Add-Member -NotePropertyName Identity -NotePropertyValue (ConvertFrom-SID $_.SecurityIdentifier.value) -Force; $_} | Foreach-Object {if ($_.Identity -eq $("$env:UserDomain\$env:Username")) {$_}}
```
I.E. OUTPUT:
```
AceType               : AccessAllowed
ObjectDN              : CN=TestService1,OU=prodUsers,DC=prod,DC=corp1,DC=com
ActiveDirectoryRights : GenericAll
OpaqueLength          : 0
ObjectSID             : S-1-5-21-3776646582-2086779273-4091361643-1604
InheritanceFlags      : None
BinaryLength          : 36
IsInherited           : False
IsCallback            : False
PropagationFlags      : None
SecurityIdentifier    : S-1-5-21-3776646582-2086779273-4091361643-1111
AccessMask            : 983551
AuditFlags            : None
AceFlags              : None
AceQualifier          : AccessAllowed
Identity              : PROD\offsec
```
Means that the current user has GenericAll access (fullcontrol) to the TestService1 account.
In this case, you can change the password of the testService1 account:
```powershell
net user <CN_NAME> <PASSWORD> /domain
```
You can do the same using <span style="color:red">ForceChangePassword</span> and <span style="color:red">AllExtendedRights</span> access rights.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Enumerate Groups</b></span>

All Local Groups:
```
net localgroup
```
Specific Local Group:
```powershell
net localgroup <group_name>
```

Specific Domain Group:
```
Get-NetGroup <group_name>
```
Get Group Current User is part of:
```
Get-ADPrincipalGroupMembership username | select name
```
OR
```
whoami /groups
```
Add user to a group
```shell
net group "<Name of the group>" /add <user_name>
```
Enumerate all domain groups that our current user has explicit access rights to:
```powershell
Get-DomainGroup | Get-ObjectAcl -ResolveGUIDs | Foreach-Object {$_ | Add-Member -NotePropertyName Identity -NotePropertyValue (ConvertFrom-SID $_.SecurityIdentifier.value) -Force; $_} | Foreach-Object {if ($_.Identity -eq $("$env:UserDomain\$env:Username")) {$_}}
```
(Check for AceType: AccessAllowed, CN= something and Identity = user in the output)
Add yourself to the group:
```powershell
net group testgroup <user> /add /domain
```
