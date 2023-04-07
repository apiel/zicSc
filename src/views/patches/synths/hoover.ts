import { Encoders } from '../../../layout/encoders.layout';
import { SynthData } from './SynthData';

const defaultValue = {};

const encoders: Encoders = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];

const main = {
    encoders,
};

export default new SynthData(
    'hoover',
    `SynthDef("hoover", {| freq = 440, amp = 1 |
        var snd, bw, delay, decay;
        freq = freq * Env([-5, 6, 0], [0.1, 1.7], [\\lin, -4]).kr.midiratio;
        bw = 1.035;
        snd = { DelayN.ar(Saw.ar(freq * ExpRand(bw, 1 / bw)) + Saw.ar(freq * 0.5 * ExpRand(bw, 1 / bw)), 0.01, Rand(0, 0.01)) }.dup(20);
        snd = (Splay.ar(snd) * 3).atan;
        snd = snd * Env.asr(0.01, 1.0, 1.0).kr(0, \\gate.kr(1));
        snd = FreeVerb2.ar(snd[0], snd[1], 0.3, 0.9);
        snd = snd * Env.asr(0, 1.0, 4, 6).kr(2, \\gate.kr(1));
        Out.ar(\\out.kr(0), snd * 0.1 * amp);
    })`,
    [main],
    defaultValue,
);
