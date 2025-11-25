---
layout:     post
author:     0x5c4r3
type: docs
permalink: Cobalt_Strike
---


<span style="font-size: 35px; color:red"><b>Cobalt Strike</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Quick Reference</b></span>
- <span style="color:red">ps</span>: enumerate running processes (focus on services like <span style="color:red">Sysmon64.exe</span>, <span style="color:red">MsMpEng</span>, <span style="color:red">elastic-endpoint</span>, <span style="color:red">elastic-agent</span>).
- <span style="color:red">printscreen</span>, <span style="color:red">screenshot</span> or <span style="color:red">screenwatch</span>: to capture the user's desktop.
- <span style="color:red">keylogger</span>: to capture keystrokes (it's a job, so run <span style="color:red">jobs</span> to list them all and <span style="color:red">jobkill \<id\></span> to kill one).
- <span style="color:red">clipboard</span>: to dump clipboard contents.
- <span style="color:red">net-logons</span>: to list the logon sessions.
- <span style="color:red">execute-assembly</span>: to execute C# executables like
    - [SharpView](https://github.com/tevora-threat/SharpView): C# port of PowerView.
    - [SharPersist](https://github.com/mandiant/SharPersist): persistent toolkit for Windows.
    - [Seatbelt](https://github.com/GhostPack/Seatbelt): AV and Security Enumeration.
    - [SharpUp](https://github.com/GhostPack/SharpUp): tool to enumerate OS misconfigurations and missing Patches that might lead to privesc.
    - [Rubeus](https://github.com/GhostPack/Rubeus): to play with Kerberos.
    - [ADSearch](https://github.com/tomcarver16/ADSearch): enumeration through custom Lightweight Directory Access Protocol (LDAP) searches
- <span style="color:red">mimikatz</span>: it spawns a new temporary process that is later on destroyed.
  - use <span style="color:red">!</span> to elevate beacon to SYSTEM (i.e. mimikatz !lsadump::sam).
  - use <span style="color:red">@</span> to impersonate beacon's thread token before running the given command (which is useful when mimikatz needs to interact with remote systems, i.e. mimikatz @lsadump::dcsync /user:DEV\krbtgt).
- <span style="color:red">dcsync</span>: to dump all username and credential data from the DC (i.e. <span style="color:red">dcsync dev.cyberbotic.io DEV\krbtgt </span>)
