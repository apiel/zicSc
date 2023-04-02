/* I made a simple synth but with some controls, and then I made a little musical pattern.
I'm a newbie, so your help will be welcome if you learn me how improve these codes.

*/
// Execute this code first
(
SynthDef(
	name:"fm3",
	ugenGraphFunc:{
		arg f1 = 220,
			freqmu = 2,
			f2,
			index = 8,
			decay = 0.25,
			vol = 0.1,
			filterstart = 2000,
			filterend = 10,
			phasemod = 10;
			f2 = freqmu * f1;
			Out.ar(
			bus: 0,
			channelsArray: Resonz.ar( 	// A filter with resonance
				PMOsc.ar(				// a simple FM oscillator
					carfreq:[f1,f1+SinOsc.kr(55,0,1,0)*2],
					modfreq:[f2-SinOsc.kr(27.5,0,1,0)*3,f2+SinOsc.kr(27.5,0,1,0)*3],
					pmindex: index,
					modphase: phasemod + SinOsc.kr(
						freq:55,
						phase:0,
						mul:1,
						add:0),
					mul: vol,
					add: 0) * Line.kr(
								start: 0.5,
								end: 0,
								dur: decay,
								doneAction: 2),
				freq: XLine.kr(
					start: filterstart,
					end: filterend,
					dur: decay - 0.09),
				bwr:1,
			    mul: 1)
		);
}).add;
);

// Rajoutons une reverb, pour cela on crée un synthé qui ne fait que cela


// Then execute this code
(
SynthDef(\FreeVerb2x2, {|outbus, mix = 0.25, room = 0.70, damp = 0.5, amp = 1.0|
    var signal;

    signal = In.ar(outbus, 2);

    ReplaceOut.ar(outbus,
        FreeVerb2.ar( // FreeVerb2 - true stereo UGen
            signal[0], // Left channel
            signal[1], // Right Channel
            mix, room, damp, amp)); // same params as FreeVerb 1 chn version

}).add;
);

// Finally execute next code

(
// On va créer deux patterns en parallèle a et b, puis c et d, puis e et f ;
var a, b, c, d, e, f, n1 = 45, n2, n3, o1, o2, o3, p1, p2, p3, r1 = 1, r2, r3, r4;
// On applique la reverb, ça sonne mieux
z = Synth(\FreeVerb2x2, [\outbus, 0], addAction:\addToTail);
// Permier pattern a
n2 = n1 + 12;
n3 = n2 + 12;
o1 = n1 + 2;
o2 = o1 + 12;
o3 = o2 + 12;
p1 = n1 + 4;
p2 = p1 + 12;
p3 = p2 + 12;
r2 = r1 * 2;
r3 = r1 * 4;
r4 = r1 * 8;
a = Pbind(
	\instrument, 'fm3',
	\dur, Pseq([0.2, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2], r1),
	//\freqmu, Pshuf([1, 2, 3, 4, 5, 6, 7, 8], 128),
	\freqmu, Pshuf([1, 2, 3, 4], r2),
	\f1, Pseq([n2,n3,n3,n2], r2).midicps,
//	\index, Prand([3,4,5,6],256),
	\vol, Prand([0.1,0.05,0.04,0.08],repeats:r4),
);
// Deuxième pattern b
b = Pbind(
	\instrument, 'fm3',
	\dur, Pseq([0.4, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 0.2], r1),
	//\freqmu, Pshuf([1, 2, 3, 4, 5, 6, 7, 8], 128),
	\freqmu, Pshuf([4, 5, 2, 7], r1),
	\f1, Pseq([n1,n2,n2,n1], r1).midicps,
	\index, Pseq([3,4,5,6], r1),
	\vol, Prand([0.2,0.15,0.1,0.2],repeats:r3),
	\filterend, Pseq(list:[10,100,1,500],repeats: r1),
	\filterstart, Pseq(list:[1000,2000,500,3000],repeats: r1),
	\phasemod, Pseq(list:[100,5,10,15,20],repeats: r1),
	\decay, Pseq(list:[0.25,0.40,0.2,0.55,0.15],repeats: r1),
);
c = Pbind(
	\instrument, 'fm3',
	\dur, Pseq([0.2, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2], r1),
	//\freqmu, Pshuf([1, 2, 3, 4, 5, 6, 7, 8], 128),
	\freqmu, Pshuf([1, 2, 3, 4], r2),
	\f1, Pseq([o2,o3,o3,o2], r2).midicps,
//	\index, Prand([3,4,5,6],256),
	\vol, Prand([0.1,0.05,0.04,0.08],repeats:r4),
);
d = Pbind(
	\instrument, 'fm3',
	\dur, Pseq([0.4, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 0.2], r1),
	//\freqmu, Pshuf([1, 2, 3, 4, 5, 6, 7, 8], 128),
	\freqmu, Pshuf([4, 5, 2, 7], r1),
	\f1, Pseq([o1,o2,o2,o1], r1).midicps,
	\index, Pseq([3,4,5,6], r1),
	\vol, Prand([0.2,0.15,0.1,0.2],repeats:r3),
	\filterend, Pseq(list:[10,100,1,500],repeats: r1),
	\filterstart, Pseq(list:[1000,2000,500,3000],repeats: r1),
	\phasemod, Pseq(list:[100,5,10,15,20],repeats: r1),
	\decay, Pseq(list:[0.25,0.40,0.2,0.55,0.15],repeats: r1),
);
e = Pbind(
	\instrument, 'fm3',
	\dur, Pseq([0.2, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2], r1),
	//\freqmu, Pshuf([1, 2, 3, 4, 5, 6, 7, 8], 128),
	\freqmu, Pshuf([1, 2, 3, 4], r2),
	\f1, Pseq([p2,p3,p3,p2], r2).midicps,
//	\index, Prand([3,4,5,6],256),
	\vol, Prand([0.1,0.05,0.04,0.08],repeats:r4),
);
f = Pbind(
	\instrument, 'fm3',
	\dur, Pseq([0.4, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 0.2], r1),
	//\freqmu, Pshuf([1, 2, 3, 4, 5, 6, 7, 8], 128),
	\freqmu, Pshuf([4, 5, 2, 7], r1),
	\f1, Pseq([p1,p2,p2,p1], r1).midicps,
	\index, Pseq([3,4,5,6], r1),
	\vol, Prand([0.2,0.15,0.1,0.2],repeats:r3),
	\filterend, Pseq(list:[10,100,1,500],repeats: r1),
	\filterstart, Pseq(list:[1000,2000,500,3000],repeats: r1),
	\phasemod, Pseq(list:[100,5,10,15,20],repeats: r1),
	\decay, Pseq(list:[0.25,0.40,0.2,0.55,0.15],repeats: r1),
);
// On fait jouer les deux patterns en parallèle, les uns à la suite des autres
Pseq([Ppar([a, b]),Ppar([c, d]),Ppar([e, f]),Ppar([c, d]),Ppar([a, b])], 3).play;
)
)
‎