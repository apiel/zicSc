import { Encoders } from '../layout/encoders.layout';
import { patchHzEncoder, patchMsEncoder, patchPercentageEncoder } from '../views/patches/encoders';
import { SynthData } from './SynthData';

const defaultValue = {
    dur: 1.0,
    ffreq: 3000,
    bend: 1,
};

const encoders: Encoders = [
    undefined,
    undefined,
    patchMsEncoder('dur', 'Duration', defaultValue, 0.05, 2),
    patchHzEncoder('ffreq', 'ffreq', defaultValue),
    undefined,
    undefined,
    undefined,
    patchPercentageEncoder('bend', 'Bend', defaultValue),
];

const main = {
    encoders,
};

export default new SynthData(
    'gabberkick',
    `SynthDef("gabberkick", { | freq = 440, amp = 1 |
        var snd, high, lfo;
        freq = freq * (Env.perc(0.001, 0.08, curve: -1).ar * 48 * \\bend.kr(1)).midiratio;
        snd = Saw.ar(freq);
        snd = (snd * 100).tanh + ((snd.sign - snd) * -8.dbamp);
        high = HPF.ar(snd, 300);
        lfo = SinOsc.ar(8, [0, 0.5pi]).range(0, 0.01);
        high = high.dup(2) + (DelayC.ar(high, 0.01, lfo) * -2.dbamp);
        snd = LPF.ar(snd, 100).dup(2) + high;
        snd = RLPF.ar(snd, 7000, 2);
        snd = BPeakEQ.ar(snd, \\ffreq.kr(3000) * XLine.kr(1, 0.8, 0.3), 0.5, 15);
        snd = snd * Env.perc(0.001, \\dur.kr(1.0)).ar(2, \\gate.kr(1), doneAction: Done.freeSelf);
        Out.ar(\\out.kr(0), snd * 0.1 * amp);
    })`,
    [main],
    defaultValue,
);
