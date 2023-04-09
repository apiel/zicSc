Maybe should not use sclang and use own sequencer that send osc message...

https://scsynth.org/t/how-to-send-raw-osc-to-create-a-simple-sound/7166/5

So would, precompile Synthdef using the IDE and then load them with custom sequencer.

# server commands

https://doc.sccode.org/Reference/Server-Command-Reference.html

# scsyndef

https://doc.sccode.org/Classes/SynthDesc.html

or could use sclang to compile it on the fly:

```js
(
var bass = SynthDef("bass303", { arg  out=0, freq = 440, wave=0, dec=1.0, env=0.10, gate=1, amp=10, cutoff= 120, res= 0.8;
    var filEnv, volEnv, waves;
    var reso = (1-res)*(0.97)+0.03;

	volEnv =  EnvGen .ar( Env .new([10e-10, 1, 1, 10e-10], [0.01, 0, dec],  'exp' ), gate, doneAction: Done.freeSelf);
	filEnv =  EnvGen .ar( Env .new([10e-10, 1, 10e-10], [0.01, dec],  'exp' ), gate);

	waves = [ Saw .ar(freq, volEnv),  Pulse .ar(freq, 0.5, volEnv)];

	Out .ar(out,  RLPF .ar(  Select .ar(wave, waves), cutoff + (filEnv * env * 10000), reso).dup * amp);
});
bass.value.asSynthDef;
bass.name;
bass.asSynthDesc;
bass.asBytes();
)
```


# C++ plugin:

- https://github.com/supercollider/example-plugins
- http://doc.sccode.org/Guides/WritingUGens.html

# osc client

- https://github.com/kaoskorobase/oscpp
- https://liblo.sourceforge.net/ and https://github.com/radarsat1/liblo/tree/master/examples

- node https://github.com/colinbdclark/osc.js with supercollider example: https://github.com/colinbdclark/osc.js#sample-code-2
- another node https://www.npmjs.com/package/node-osc

# alternative

- https://csound.com/get-started.html
