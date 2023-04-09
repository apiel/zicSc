SynthDef("bubble", { arg out=0, amp = 1, minReleaseTime=2.0, maxReleaseTime=6.0, minWobble=0.0, maxWobble=10.0, minInnerWooble=0.0, maxInnerWobble=16.0;
    var f, zout;
    var wobble=Rand(minWobble, maxWobble);
    var innerWobble=Rand(minInnerWooble, maxInnerWobble);
    var releaseTime=Rand(minReleaseTime, maxReleaseTime);
    f = LFSaw.kr(wobble, 0, 24, LFSaw.kr([innerWobble, innerWobble / 1.106], 0, 3, 80)).midicps;
    zout = CombN.ar(SinOsc.ar(f, 0, 0.04), 0.2, 0.2, 4);  // echoing sine wave
    zout = zout * EnvGen.kr(Env.linen(releaseTime: releaseTime), doneAction: Done.freeSelf);
    Out.ar(out, zout * amp);
})