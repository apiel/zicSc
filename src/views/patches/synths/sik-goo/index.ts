import { Encoders } from '../../../../layout/encoders.layout';
import { currentPatchId, getPatch } from '../../../../patch';
import { SynthData } from '../SynthData';

const encoders: Encoders = [
    undefined,
    undefined,
    undefined,
    {
        node: {
            title: 'bwfreq',
            getValue: () => getPatch(currentPatchId).getData('bwfreq').toString(),
        },
        handler: async (direction) => {
            const patch = getPatch(currentPatchId);
            patch.setNumber('bwfreq', direction, 10, 10000, 10, 100);
            return true;
        },
    },
    undefined,
    undefined,
    undefined,
    undefined,
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
