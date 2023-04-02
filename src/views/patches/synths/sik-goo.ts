import { Encoders } from '../../../layout/encoders.layout';
import { currentPatchId, getPatch } from '../../../patch';
import { patchNumberEncoder } from '../encoders';
import { SynthData } from './SynthData';

const d = {
    bwfreq: 800,
    formfreq: 100,
};

const encoders: Encoders = [
    undefined,
    undefined,
    undefined,
    patchNumberEncoder('bwfreq', 'bwfreq', d, 10, 10000, {
        ratio: 10,
        shiftRatio: 100,
        unit: 'Hz',
    }),
    undefined,
    undefined,
    undefined,
    patchNumberEncoder('formfreq', 'formfreq', d, 10, 10000, {
        ratio: 10,
        shiftRatio: 100,
        unit: 'Hz',
    }),
];

const main = {
    encoders,
};

export default new SynthData(
    'sik-goo',
    `SynthDef("sik-goo", { |out, note = 60, formfreq = 100, gate = 1.0, bwfreq = 800|
      var x;
      var freq = note.midicps;
      x = Formant.ar(
          SinOsc.kr(0.02, 0, 10, freq),
          formfreq,
          bwfreq
      );
      x = EnvGen.kr(Env.adsr, gate, Latch.kr(gate, gate), doneAction: 2) * x;
      Out.ar(out, x);
  })`,
    [main],
);
