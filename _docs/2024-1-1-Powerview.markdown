---
layout:     post
author:     0x5c4r3
type: docs
permalink: PowerView
---

<span style="font-size: 35px; color:red"><b>PowerView</b></span>
&nbsp;
If from CobaltStrike:
```powershell
powershell-import C:\Tools\PowerSploit\Recon\PowerView.ps1
```
and then run every command like:
```powershell
powershell Get-Domain
```
&nbsp;

<span style="color:red">Eventual alternatives can be [ADSearch](https://blok.rocks/ADSearch) or SharpView (C# porting of PowerView).</span>
---
&nbsp;
<span style="font-size: 25px; color:white"><b>Quick Reference</b></span>
<span style="color:red"><b>Get-Domain</b></span>
Get single domain information (domain can be specified with <span style="color:red">-Domain</span>)
```powershell
Get-Domain
```
<span style="color:red"><b>Get-DomainController</b></span>
Get information on the DC:
```powershell
Get-DomainController | select Forest, Name, OSVersion | fl
```
<span style="color:red"><b>Get-ForestDomain</b></span>
Get all domains in the Forest (forest can be specified with <span style="color:red">-Forest</span>)
```powershell
Get-ForestDomain
```
<span style="color:red"><b>Get-DomainPolicyData</b></span>
Get default domain policy (i.e. domain password policy)
```powershell
Get-DomainPolicyData | select -expand SystemAccess
```
<span style="color:red"><b>Get-DomainUser</b></span>
Get domain user information:
```powershell
Get-DomainUser -Identity <user> -Properties DisplayName, MemberOf | fl
```
<span style="color:red"><b>Get-DomainComputer</b></span>
Get all computers or specific computer objects:
```powershell
Get-DomainComputer -Properties DnsHostName | sort -Property DnsHostName
```
<span style="color:red"><b>Get-DomainOU</b></span>
Get Organization Units or specific OU objects (File Servers, Domain Controllers, SQL Servers...):
```powershell
Get-DomainOU -Properties Name | sort -Property Name
```
<span style="color:red"><b>Get-DomainGroup</b></span>
Get all domain groups or specific domain group objects (Domain Admins, DnsAdmins, MS SQL Admins...):
```powershell
Get-DomainGroup | where Name -like "*Admins*" | select SamAccountName
```
<span style="color:red"><b>Get-DomainGroupMember</b></span>
Get members of a specific domain group:
```powershell
Get-DomainGroupMember -Identity "Domain Admins" | select MemberDistinguishedName
```
<span style="color:red"><b>Get-DomainGPO</b></span>
Get all Group Policy Objects (GPOs) or specific GPO objects:
```powershell
Get-DomainGPO -Properties DisplayName | sort -Property DisplayName
```
<span style="color:red"><b>Get-DomainGPOLocalGroup</b></span>
Get all GPOs that modify local group membership through Restricted Groups or Group Policy Preferences:
```powershell
Get-DomainGPOLocalGroup | select GPODisplayName, GroupName
```
<span style="color:red"><b>Get-DomainGPOUserLocalGroupMapping</b></span>
Enumerates the machines where a specific domain user/group is a member of a specific local group:
```powershell
Get-DomainGPOUserLocalGroupMapping -LocalGroup Administrators | select ObjectName, GPODisplayName, ContainerName, ComputerName | fl
```
<span style="color:red"><b>Get-DomainGPOUserLocalGroupMapping</b></span>
Return all domain trusts for the current or specified domain:
```powershell
Get-DomainTrust
```
