(
SynthDef("raygun", {arg amp = 0.5, sinfreq = 1000, glissf = 0.001, att = 0.01, rel = 0.9;
    var gliss = XLine.kr(sinfreq, sinfreq*glissf, rel);
    var snd = SinOsc.ar(gliss);
    var env = EnvGen.kr(Env.perc(att, rel), doneAction: 2);
    snd = snd * env * amp;
    Out.ar(0, snd);
}).add;
)

(
Pbind(
    \instrument, "raygun",
    \dur, Pseq([0.75,0.75,0.75,0.75,0.25,0.25,0.25]*0.5, inf),
	\amp, 0.4
).play;
)