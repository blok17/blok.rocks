---
layout:     post
author:     0x5c4r3
image: /img/Car_Hacking_Part_3/twitter5.png
type: blog
---
# <span style="color:red;font-size:17px;"><ins><b>Car Hacking Part 3: Rolljam Attack</b></ins></span>

&nbsp;

And now the fun part. As explained in the <a href="https://blok.rocks/blog/2022-01-14-Car-Hacking-Part-1:-Intro.html" style="color:red;">Intro</a>, rolling code algorithms implement an array of ordered single-use codes, which expire after being used once. Also, the list works in a way that if we are at a certain level - let's say we are at code at position 123 in the list -, all the other codes that precede that one are considered already expired and not usable. This means that if we click the keyfob 10 times away from the car (so that the car does not receive anything) and we intercept all these 10 signals, the only code that will be usable to open the car is the 10th (the last signal that the keyfob sent).    
This method is safe against replay attacks, but there is still a way to bypass it, using a bit of social engineerig and technical skills.

&nbsp;

<ins style="color:red;">Attack Approach - Theory</ins>
In order to achieve the goal of opening the car remotely, we need a little bit of social engineering. I'll try to explain the approach using the next ascii pictures. Let's say the owner of the car is represented by the key, while we are the skull (obviously). The owner needs to hurry to a dentist appointment, so he'll open the car remotely, as he usually does. We'll intercept the signal sent from the keyfob, stop it and store it, so that the car do not receive it.
<p>                  
      __                              .-.                          ______
     /o \_____         1             (0.0)                        /|_||_\`.__
     \__/-="="` --------------->   '=.|m|.='                     (   _    _ _\
                                   .='`"``=.                     =`-(_)--(_)-' 
 
</p>

The owner, who obviously is a muggle and does not know the dark magic we are using, will think that the car did not pick up the signal he just sent, so he'll press the keyfob again. This time we will intercept the second signal he sent, store it and immediately send the first one, so that he'll think that this time, his pressing the keyfob worked.


<p>                  
      __                              .-.                          ______
     /o \_____         2             (0.0)           1            /|_||_\`.__
     \__/-="="` --------------->   '=.|m|.='  --------------->   (   _    _ _\
                                   .='`"``=.                     =`-(_)--(_)-' 
 
</p>

This way we still have the second signal he just sent and with that, we'll be able to remotely open the car once the owner will have left.

<p>                  
      __                              .-.                          ______
     /o \_____                       (0.0)           2            /|_||_\`.__
     \__/-="="`                    '=.|m|.='  --------------->   (   _    _ _\
                                   .='`"``=.                     =`-(_)--(_)-' 
 
</p>

&nbsp;

<ins style="color:red;">Attack Approach - Practice</ins>
In order to perform such attack, we need to introduction to <b>jamming</b>: jamming is basically sending a very strong signal, close to the one we are interested in, so that all the devices listening for that frequency (i.e. a car) won't be able to receive the original signal.   
Also, to prove that this method works, we can limit our practice approach to dealing with jamming, recording and fintering the signal, since all the other functions are only a matter of simple implementation and do not need any particolar attention.

&nbsp;

<img src="/img/Car_Hacking_Part_3/jamming.png" style="width:50%;height:50%;display:block;margin-left:auto;margin-right:auto;" alt="jamming Pic">

&nbsp;

The picture above is basically a scheme representing some signals happening around 433.92MHz (our car and keyfob works at 433.92MHz). Le't start analysing the receiving window: each device has such structure since the frequency it's waiting for won't always be precisely 433.92MHz, but can vary based on different aspects (i.e. temperature). Having a receiving window allows the receiving device to detect and get the signal even if it's slightly moved. Unfortunatrly, there is no way to detect where the receiving window starts or ends, but it's safe to suppose that will be around 100kHz wide, with its central frequency at 433.92MHz.   
While recording these signals, we are jamming and clicking the car keyfob. We can clearly see that both the signals are in the device receiving window and we can also see how the jamming signal is far higher in gain than the original signal on the right. This will force the receiving device to only consider the higher signal, ignoring all the others (aka the car won't open).In the meanwhile, we record all the section of interesting frequencies, to then cut only what we need, as shown in the GNU Radio scheme below, that uses a BladeRF to both jam and record the signals:

&nbsp;

<img src="/img/Car_Hacking_Part_3/receive.png" style="width:80%;height:80%;display:block;margin-left:auto;margin-right:auto;" alt="GNU_Receive Pic">
  
&nbsp;

The first row is configuring one of the BladeRF TX Antennas sending a strong triangle wave to jam the signal at 433.85MHz. The second row configures the receiver, another RX antenna from the BladeRF, recording the window of frequencies happening in a file and printing it on a GUI. Running this script, we are basically able to store a file that we will need to filter later on, to isolate the original wave sent from the keyfob.

&nbsp;

<img src="/img/Car_Hacking_Part_3/send.png" style="width:80%;height:80%;display:block;margin-left:auto;margin-right:auto;" alt="GNU_Send Pic">
  
&nbsp;

With the script above, we are able to filter out, using a lowpass filter with a cutoff at 60kHz, only the signal that we need, and replay it to the car, that will pop open, as shown in the video below:

&nbsp;

<!-- <img src="/img/Car_Hacking_Part_3/car.gif" style="width:70%;height:70%;display:block;margin-left:auto;margin-right:auto;" alt="GNU_Send Pic"> -->

&nbsp;

<iframe width="560" height="315" style="display:block;margin-left:auto;margin-right:auto;" src="https://www.youtube.com/embed/Eq_0i4Ahtas" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
