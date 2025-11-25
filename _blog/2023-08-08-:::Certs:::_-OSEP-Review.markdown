---
layout:     post
author:     0x5c4r3
image: /img/osep.png
type: blog
---
# <span style="color:red;font-size:17px;"><ins><b>OSEP Review</b></ins></span>

&nbsp;
<ins></ins>
Since my knowledge on red teaming was relatively zero - apart from a couple machines on HTB (which makes me feel like a guy that shares the "top 1% on tryhackme" on his Linkedin public description), I decided to get into ADs from 0 to 100 subscribing to <a href="https://www.offsec.com/courses/pen-300/" style="color:red;">Evasion Techniques and Breaching Defenses (PEN-300)</a>, which is the course ending up with the OSEP exam.

&nbsp;

Here's what it's been for me.
&nbsp;

<p>                      
               ,   ,                        
              /////|                        .----.
             ///// |            .---------. | == |
            |~~~|  |            |.-"""""-.| |----|
            |===|  |  ------->  ||<span style="color:red;">$</span>        || | == | -------> EXAM
            |p 3|  |            |'-.....-'| |::::|
            |e 0|  |            `"")---(""` |___.|
            |n 0| /            /:::::::::::\    
            |===|/            /:::=======:::\ \"\
            '---'               

</p>
&nbsp;
<ins style="color:red;">Preparation</ins>
I subscribed to the LEARN ONE, which basically gives you access to the labs and documentation for a whole year. It costs more, but I believe it's the best type of subscription for someone that works in cybersec 9-to-5 and would like to keep having a normal life (I'm talking to you mate, get some friends, go swimming I don't know...).
&nbsp;
I started in December and I was basically done with the theory mid May. Ngl, I did do some of the exercises of the course, but most of the time I was just following step-by-step what the documentation explained, doing exactly what was described and trying to understand how everything worked. I used <a href="https://obsidian.md/" style="color:red;">Obsidian</a> to take notes instead of CherryTree and I must say I kinda liked it, very handy and good looking.
&nbsp;
The notes taking is really crucial, the course fully explains how to build several C# exploits, but often the only necessary part is the final script (this is a very important tip on how to take notes: since there is a lot of theory to go through, make sure to highlight the final/best scripts to then reuse those in other situations! Theory will describe every exploit from the simple ones to the more complicated - if you have the possibility, always use the sophisticated ones first, as they have more chances of working and not being detected by AVs).
&nbsp;

<ins style="color:red;">Challenges</ins>
The course comes with 6 very well done challenges which, in my opinion, are more then enough to get prepared for the exam. Each single challenge covers different course topics to a good extent.
I just did those for a couple times each (it took me from mid May to mid August, but I had plenty of bench time as penetration tests are less requested by companies during summer time), focusing on deeply understood how each exploit worked - clearly using the exploits that have been explained during the course.
&nbsp;
So, sometimes during the challenges (or during the exam) it can happen that you end up requiring some exploit not studied during PEN-300: don't panic my g, if you see something new usually it's OffSec trying to make you shit yourself. Most of the vulnerabilities that you find are covered by the theory and, if not, you can easily google and find a solution. It will happen, so get mentally prepared. Just fyi.
&nbsp;
Also: exploiting ADs, there are usually 2 ways of hacking something, remotely (from Kali, i.e. psexec.py) and Locally (from the pwned machine, i.e. psexec.exe). It's fundamental to understand, be ready and be able to do both since - during both the exam and the challenges - it might happen that one of the two ways is not viable because of configurations/AVs/firewalls and that.
&nbsp;
Apart from the standard tools you always use (impackets, crackmapexec...), here's the <a href="https://github.com/0x5c4r3/OSEP/tree/main" style="color:red;">Collection of beautiful pre-compiled Tools</a> I used during PEN-300 and OSEP. This can be really helpful during challenges as - trying different type of exploits with different tools - you'll get used to exploit a vulnerability in different ways, which definitely help you in case i.e. the default "psexe.exe does not work omg what do I do now".
&nbsp;
I, like everyone else apparently, also bought a month subscription to HTB Prolabs, in my opinion - in this case - completely useless. Wasted money. Could have gone grabbing a beer instead.
I got the first flags and stopped because yeah enough, but hear me out: <span style="color:red;">the challenges PEN-300 provide are enough for you to go through the exam</span>. Yup. You don't need any other thing. You might, if you feel insecure, but I felt insecure and still made it.
Again, as long as you cover everything in the course and understand the processes you go through, you're ready.
&nbsp;
<ins style="color:red;">Exam</ins>
In order to go back to your mom and tell her you passed the exam, you either need to get to a final "secret" flag or you need to collect different 10 flags. I personally did the 1st.
Yeah I mean it was definitely tough, not a piece of cake, but I found it to be such good fun. The environment you gotta hack is quite big and can be scary at first, but maybe you don't really need to hack every single machine you see there yk...
I started at 9 and finished at 4:30pm the day after, then chilled talking about Christine Aguilera with the proctor (I'm very much joking, please don't talk about Christina Aguilera with the proctor).
Passed first-try bitch, mom's proud.







