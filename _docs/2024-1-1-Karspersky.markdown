---
layout:     post
author:     0x5c4r3
type: docs
permalink: Karspersky
---


<span style="font-size: 35px; color:red"><b>Karspersky</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Karspersky Evasion</b></span>
```shell
sudo kesl-control --stop-t 1
```

TO scan file: <span style="color:red">sudo kesl-control --scan-file ./eicar.txt</span>

I.E. a 64-bit Meterpreter payload in .elf encoded with the x64/zutto_dekiru encoder is not detected.
	Also a msfvenom C program won't be detected.
