(
    ~step1 = PatternProxy((\degree: 1));
    ~step1b = PatternProxy((\degree: 9, \dur: 4));
    ~step2 = PatternProxy((\degree: 2));
    ~step3 = PatternProxy((\degree: 3));
    ~step4 = PatternProxy((\degree: { "last".postln; if (s > 0, { "should stop".postln; p.stop }); 4 }));

    ~steps = PatternProxy(Ppar([Pseq([~step1,~step2,~step3,~step4], inf), ~step1b]));

    s = 0;
    p = ~steps.play;
)
s = 1

