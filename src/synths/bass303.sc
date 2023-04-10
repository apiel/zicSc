SynthDef("bass303", {  arg  out=0, freq = 440, wave=0, cutoff=100, res=0.2,
		dec=1.0, env=0.10, gate=1, amp=1;
	
    var filEnv, volEnv, waves;
    var reso = (1-res)*(0.97)+0.03;

	volEnv =  EnvGen .ar( Env .new([10e-10, 1, 1, 10e-10], [0.01, 0, dec],  'exp' ), gate, doneAction: Done.freeSelf);
	filEnv =  EnvGen .ar( Env .new([10e-10, 1, 10e-10], [0.01, dec],  'exp' ), gate);

	waves = [ Saw .ar(freq, volEnv),  Pulse .ar(freq, 0.5, volEnv)];

	Out .ar(out,  RLPF .ar(  Select .ar(wave, waves), cutoff + (filEnv * env * 10000), reso).dup * amp * 0.15);
})