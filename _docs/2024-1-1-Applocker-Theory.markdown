---
layout:     post
author:     0x5c4r3
type: docs
permalink: Applocker_Theory
---


<span style="font-size: 35px; color:red"><b>Applocker Theory</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Commands</b></span>

Prior to Windows 7, Microsoft introduced the _Software Restriction Policies_ (_SRP_) whitelisting solution. It is still available but has been superseded by <font style="color:#981f3a">AppLocker </font>(APPID.SYS and APPIDSVC service), which was introduced with Windows 7 and is still available in current versions of Windows 10.
The most recent solution is _Windows Defender Application Control_ (_WDAC_), rarely deployed since it needs strict hardware requirements.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Applocker Rules</b></span>
Whitelisting based on:
- File Path/File Name
- File Hash (SHA256 Authenticode hash)
- File Digital Signature (aka Publisher)

You can check rules from the Local Group Policy Editor (_gpedit.msc_), we'll navigate to _Local Computer Policy_ -> _Computer Configuration_ -> _Windows Settings_ -> _Security Settings_ -> _Application Control Policies_ and select the _AppLocker_.

Applocker blocks: 
- Executables
- Windows Installers
- Scripts
- Packaged Apps
- DLLs

&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Applocker Bypass</b></span>

- [Trusted Folders, Alternate Data Streams and Third Party Executables](https://blok.rocks/Alternate_Data_Streams)
- [Bypass with Powershell](https://blok.rocks/Applocker_Bypass_Powershell)
- [Bypass with Csharp](https://blok.rocks/Applocker_Bypass_CSharp)
- [Bypass with JScript](https://blok.rocks/Applocker_Bypass_JScript)
