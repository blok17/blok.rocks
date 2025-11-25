---
layout:     post
author:     0x5c4r3
type: docs
permalink: Windows_Linux_Comms
---


<span style="font-size: 35px; color:red"><b>Windows - Linux Communications: Samba</b></span>

```shell
sudo apt install samba
sudo mv /etc/samba/smb.conf /etc/samba/smb.conf.old
sudo nano /etc/samba/smb.conf
```

Change Path to the Correct one:
```
[visualstudio]
 path = /home/kali/data
 browseable = yes
 read only = no
```

Change Kali with name of the user (if needed):
```shell
sudo smbpasswd -a kali
sudo systemctl start smbd
sudo systemctl start nmbd
mkdir /home/kali/data
chmod -R 777 /home/kali/data
```

Visit the folder with <span style="color:red">\\<LOCAL_IP></span>
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Quick SMB Folder on Kali</b></span>
```shell
smbserver.py <folder_name> <folder_path>
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Create SMB Share to share files between Linux and Windows</b></span>

On Kali:
```shell
impacket-smbserver <NAME_FOLDER> <PATH_TO_THE_LOCAL_FOLDER> -smb2support -user <user> -password <password>
```

On Windows
```shell
$pass = convertto-securestring '<password>' -AsPlainText -Force
```

```shell
$cred = New-Object System.Management.Automation.PSCredential('<user>',$pass)
```

```shell
New-PSDrive -Name <NEW_NAME> -PSProvider FileSystem -Credential $cred -Root \\<kali_IP>\<NAME_FOLDER>
```

to access the share from Windows, just run <span style="color:red"># cd <NEW_NAME>:</span>
