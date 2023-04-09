{
var time = 8;
var freq = (40-12).midicps;
var a = VarSaw.ar(freq/2, width: XLine.ar(0.5,1,time)).range(0,XLine.ar(1,1/1000,time));
var tone = SinOsc.ar(freq).fold(-1*a,a);
Out.ar(0, tone.dup);
}.play;