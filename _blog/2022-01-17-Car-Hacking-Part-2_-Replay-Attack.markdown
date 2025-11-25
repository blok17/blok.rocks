---
layout:     post
author:     0x5c4r3
image: /img/Car_Hacking_Part_2/twitter_banner.png
type: blog
---
<span style="color:red;font-size:17px;"><ins><b>Car Hacking Part 2: Replay Attack</b></ins></span>

&nbsp;

Before getting into more advanced methodologies, it's always better to understand how the process works (I know it's a boring process, but cmon, let's do things the proper way). In order to do that, I started hacking simple devices such as radio doorbells, remotes, iot devices and so on. Note that most of these devices, if recently bought, implement Rolling Code algorithms (I tested my retractable awning, it implements rolling code, fucking useless tbh, but oh well). If you want to find a device that still uses the single code approach, you can find an old/cheap one online.

In my case, I used a cheap radio doorbell.

&nbsp;
<p>
              ________
             / ______ \                                <>
             || _  _ ||                                ||
             ||| || |||                                ||
             |||_||_|||               ABC              ||
             || _  _o|| (o)   ------------------>     /  \
             ||| || |||                              |#   |
             |||_||_|||                              /    \
             ||______||                             '-....-'
                                                        U
</p>
&nbsp;

The doorbell has a remote to stick outside the door that, when clicked, sends a signal to the actual doorbell that playes a sound, like an ordinary one. Very simple, very cheap.

&nbsp;
  
<ins style="color:red;">Recording the signal</ins>
As explained in the <a href="https://blok.rocks/blog/2022-01-14-Car-Hacking-Part-1:-Intro.html" style="color:red;">Introduction</a>, devices that implement single code are very easy to hack, since we only need to intercept, store and replay the signal.

&nbsp;
  
I will explain these steps using a BladeRF, since it's more handy due to the fact that the hardware is full-duplex and I can use it to both send and receive signals (we'll need to do it during the Rolljam Attack, don't worry, I'll explain later).

&nbsp;
  
First thing first, let's intercept and record the signal. We'll use URH to do so. The configuration of the hardware you are using - whatever it is, BladeRF, HackRF or even an RTL-SDR) is super easy and basically all automatic. We fire up URH, click the doorbell outside the door and stop URH. Once recorded, let's just crop it so that we don't really have too much empty seconds stored in the signal.

&nbsp;
  
<img src="/img/Car_Hacking_Part_2/signal_doorbell.png" style="width:80%;height:80%;display:block;margin-left:auto;margin-right:auto;" alt="Doorbell Signal Pic">
  
&nbsp;

Once done, we don't really need to do anything else but send it from our interface. We have just recorded the single and unique code that is used every time the doorbell is clicked, so we can play it again, whenever we want, to make it play the sound. That's it. It's that simple. And trust me, when your office has a radio doorbell installed, it's also very fun.
  
&nbsp;
  
Now, imagine a car implementing that algorithm. That's definitely less fun (if the car is yours).Anyone might be able to perform such attack, so yeah, think about it next time you leave your purse in your old car. Also, I actually found out during my random car testing, that some of the modern cars (I'm talking 2020/2021) are still implementing such algorithm... and that's scary honestly.   
Anyways, easy-peasy, not really worth spending more time talking about this, so let's go straight to <a href="https://blok.rocks/blog/2022-01-27-Car-Hacking-Part-3:-Rolljam-Attack.html" style="color:red;">Rolljam Attacks</a>.
  


