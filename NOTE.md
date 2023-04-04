(
~steps = PatternProxy(
  Pseq([
	Pbind(
	  \degree, Pseq([1,2,3,4], inf),
      \dur, 0.25
    ), Pbind(
	  \degree, Pseq([4,3,2,1], 1),
      \dur, 0.25
    )], inf));

p = ~steps.play;
)

(
~steps.source = Pseq([
	Pbind(
	  \degree, Pseq([1,2,3,4], 1),
      \dur, 0.25
    ), Pbind(
	  \degree, Pseq([4,3,2,1], 1),
      \dur, 0.25
    )], inf)
)
p.stop;


# polyphony

(
 var a, b;
 a = Pbind(\note, Pseq([1,2,3,4], 4), \dur, 0.25);
 b = Pbind(\note, 10, \dur, 1);
 p = Ppar([a, b ]).play;
)
p.stop;

# stuff

(
s = 0; // set to 1 to stop at the end

a = Pbind(
	  \degree, Pseq([1,2,3,4], inf),
);
​
​
Tdef(\x, {
    var str = Pevent(a).asStream, event;
    loop {
        event = str.next;
        event.play;
		event[\degree].postln;
		if (s > 0 && event[\degree] == 4, { "should stop".postln; Tdef(\x).stop });
        event[\dur].wait;
    }
​
}).play;
)

s=1

## yoyoy

Tdef(\z, Pseq([1,2,3,4], inf));
Tdef(\z, Pseq([1,2,3,4], 1));

(
s = 0; // set to 1 to stop at the end
p =	Pbind(
	  \degree, Tdef(\z),
	\x, Pfunc { |event| event[\degree].postln; if (s > 0 && event[\degree] == 4, { "should stop".postln; p.stop }); 1 }
    ).play;
)
p.stop;

s=1



### yihaa

(
s = 0; // set to 1 to stop at the end
p =	Pbind(
	  \degree, Pseq([1,2,3,4], inf),
	\x, Pfunc { |event| event[\degree].postln; if (s > 0 && event[\degree] == 4, { "should stop".postln; p.stop }); 1 }
    ).play;
)
p.stop;

s=1
