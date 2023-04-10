SynthDef("psykick", { arg out=0, duration = 0.15, atk = 0.005, amp = 1;
    var zout = SinOsc.ar(
        EnvGen.ar(
            Env(
            NamedControl.kr(\freq_l, [2960, 70, 90]),
            NamedControl.kr(\freq_d, [0.07, 0.2]),
            NamedControl.kr(\freq_c, [-13, -1]),
            )
        ),
        mul:amp * EnvGen.ar(
            Env.perc( atk, duration - atk, curve: NamedControl.kr(\amp_c, [-1, 6])),
            doneAction: Done.freeSelf
        );	
    );
    Out.ar(out, zout);
})