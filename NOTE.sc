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

(
    ~step1 = PatternProxy((\degree: 1));
    ~step1b = PatternProxy((\degree: 9, \dur: 4));
    ~step2 = PatternProxy((\degree: 2));
    ~step3 = PatternProxy((\degree: 3));
    ~step4 = PatternProxy((\degree: 4));
    ~lastStep = PatternProxy(Pseq([
	      (\degree: Rest(), dur: 3), 
	      (\degree: { "last".postln; if (s > 0, { "should stop".postln; p.stop }); Rest() })
    ], inf));

    ~steps = PatternProxy(
	     Ppar([
		     Pseq([~step1,~step2,~step3,~step4], inf), 
		     ~step1b,
		     ~lastStep,
         ])
    );

    s = 0;
    p = ~steps.play;
)
s = 1

// step probability
a = Pwrand([0,1], [0.95, 0.05], inf).asStream;
a.next
// or could use
a = Pwhite(0.0, 1.0, inf).asStream;
a.next;
// or
// 7.do({ (100.rand > 95).postln; });
if(100.rand > 80, 1, 0);
// or https://doc.sccode.org/Classes/Pprob.html
x = Pprob([0, 1]).asStream;
if(x.next>0.9,1,0)

// https://doc.sccode.org/Guides/Randomness.html