---
layout:     post
author:     0x5c4r3
type: docs
permalink: ADSearch
---

<span style="font-size: 35px; color:red"><b>ADSearch</b></span>
AD Enumeration with custom Lightweight Directory Access Protocol (LDAP) searches.
From CobaltStrike:
i.e. search for all objects whose category is "user":
```powershell
execute-assembly C:\Tools\ADSearch\ADSearch\bin\Release\ADSearch.exe --search "objectCategory=user"
```
i.e. search for all domain groups that ends with "admins" and only output cn and member info:
```powershell
execute-assembly C:\Tools\ADSearch\ADSearch\bin\Release\ADSearch.exe --search "(&(objectCategory=group)(cn=*Admins))" --attributes cn,member
```
