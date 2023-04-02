import { Encoders } from '../../../layout/encoders.layout';
import { patchMsEncoder, patchNumberEncoder, patchPercentageEncoder } from '../encoders';
import { SynthData } from './SynthData';

const defaultValue = {
    dec: 1.0,
    cutoff: 100,
    res: 0.2,
    env: 1000,
};

const encoders: Encoders = [
    undefined,
    undefined,
    patchMsEncoder('dec', 'Decay', defaultValue, 0.05, 5),
    patchNumberEncoder('cutoff', 'Cutoff', defaultValue, 100, 10000, {
        ratio: 100,
        shiftRatio: 500,
        unit: 'Hz',
    }),
    undefined,
    undefined,
    patchNumberEncoder('env', 'Envelope', defaultValue, 100, 10000, {
        ratio: 100,
        shiftRatio: 500,
    }),
    patchPercentageEncoder('res', 'Resonnance', defaultValue),
];

const main = {
    encoders,
};

export default new SynthData(
    'bass303',
    `SynthDef ( "bass303" , {  arg  out=0, note=60, wave=0, cutoff=100, res=0.2,
		dec=1.0, env=1000, gate=1, vol=0.2;
	
    var filEnv, volEnv, waves;
    var freq = note.midicps;
    var reso = (1-res)*(0.97)+0.03;

	volEnv =  EnvGen .ar( Env .new([10e-10, 1, 1, 10e-10], [0.01, 0, dec],  'exp' ), gate, doneAction: 2);
	filEnv =  EnvGen .ar( Env .new([10e-10, 1, 10e-10], [0.01, dec],  'exp' ), gate);

	waves = [ Saw .ar(freq, volEnv),  Pulse .ar(freq, 0.5, volEnv)];

	Out .ar(out,  RLPF .ar(  Select .ar(wave, waves), cutoff + (filEnv * env), reso).dup * vol);
})`,
    [main],
);
