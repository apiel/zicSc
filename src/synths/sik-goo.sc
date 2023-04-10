SynthDef("sik-goo", { |out, freq = 440, formfreq = 100, gate = 1.0, bwfreq = 800, amp = 1, gateDuration=0|
    var x = Formant.ar(
        SinOsc.kr(0.02, 0, 10, freq),
        formfreq,
        bwfreq
    );

	gate = gate * EnvGen.kr(Env.new([1, 0], [gateDuration], [0], gateDuration.roundUp()));

    x = EnvGen.kr(Env.adsr, gate, Latch.kr(gate, gate), doneAction: Done.freeSelf) * x;
    Out.ar(out, x * amp);
})