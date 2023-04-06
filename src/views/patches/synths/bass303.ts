import { Encoders } from '../../../layout/encoders.layout';
import { currentPatchId, getPatch } from '../../../patch';
import { patchMsEncoder, patchNumberEncoder, patchPercentageEncoder } from '../encoders';
import { SynthData } from './SynthData';

const defaultValue = {
    dec: 1.0,
    cutoff: 100,
    res: 0.2,
    env: 0.10,
    wave: 0,
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
    {
        node: {
            title: 'Wave',
            getValue: () =>
                getPatch(currentPatchId).getData<number>('wave', defaultValue['wave'] as number) ? 'Square' : 'Saw',
        },
        handler: async (direction) => {
            const patch = getPatch(currentPatchId);
            patch.setNumber('wave', defaultValue['wave'] as number, direction, 0, 1);
            return true;
        },
    },
    patchPercentageEncoder('env', 'Envelope', defaultValue),
    patchPercentageEncoder('res', 'Resonnance', defaultValue),
];

const main = {
    encoders,
};

export default new SynthData(
    'bass303',
    `SynthDef("bass303", {  arg  out=0, freq = 440, wave=0, cutoff=100, res=0.2,
		dec=1.0, env=0.10, gate=1, amp=1;
	
    var filEnv, volEnv, waves;
    var reso = (1-res)*(0.97)+0.03;

	volEnv =  EnvGen .ar( Env .new([10e-10, 1, 1, 10e-10], [0.01, 0, dec],  'exp' ), gate, doneAction: Done.freeSelf);
	filEnv =  EnvGen .ar( Env .new([10e-10, 1, 10e-10], [0.01, dec],  'exp' ), gate);

	waves = [ Saw .ar(freq, volEnv),  Pulse .ar(freq, 0.5, volEnv)];

	Out .ar(out,  RLPF .ar(  Select .ar(wave, waves), cutoff + (filEnv * env * 10000), reso).dup * amp);
})`,
    [main],
);
