(
    ~step1 = PatternProxy(
        Pbind(
        \degree, 1,
        )
    );
    ~step1b = PatternProxy(
        Pbind(
        \degree, 9,
        \dur, 4
        )
    );
    ~step2 = PatternProxy(
        Pbind(
        \degree, 2,
        )
    );
    ~step3 = PatternProxy(
        Pbind(
        \degree, 3,
        )
    );
    ~step4 = PatternProxy(
        Pbind(
        \degree, 4,
        \x, Pfunc { "last step".postln; if (s > 0, { "should stop".postln; p.stop }); 1 }
        )
    );

    ~steps = PatternProxy(Pseq([Ppar([~step1, ~step1b]),~step2,~step3,~step4]));

    s = 0;
    p = ~steps.play;
)

// This work:
(
    s = 0;
    p = Pseq([
	  //Ppar((\degree: 1), (\degree: 6, \dur: 4)),
	  (\degree: 1),
	  (\degree: 2),
	  (\degree: 3),
	  (\degree:  { "last".postln; if (s > 0, { "should stop".postln; p.stop }); 4 })
	  ], inf).play;
)

(
    ~step1 = PatternProxy(
        Pbind(
        \degree, Pseq([1], 1),
        )
    );
    ~step1b = PatternProxy(
        Pbind(
        \degree, Pseq([9], 1),
        \dur, 4
        )
    );
    ~step2 = PatternProxy(
        Pbind(
        \degree, Pseq([2], 1),
        )
    );
    ~step3 = PatternProxy(
        Pbind(
        \degree, Pseq([3], 1),
        )
    );
    ~step4 = PatternProxy(
        Pbind(
        \degree, Pseq([4], 1),
		\x, Pfunc { "last".postln; if (s > 0, { "should stop".postln; p.stop }); 1 }
        )
    );

~steps = PatternProxy(Ppar([Pseq([~step1,~step2,~step3,~step4], inf), Pseq([~step1b], inf)]));

    s = 0;
    p = ~steps.play;
)
s = 1



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



