import { Encoders } from '../../../layout/encoders.layout';
import { patchHzEncoder } from '../encoders';
import { SynthData } from './SynthData';

const defaultValue = {
    bwfreq: 800,
    formfreq: 100,
};

const encoders: Encoders = [
    undefined,
    undefined,
    undefined,
    patchHzEncoder('bwfreq', 'bwfreq', defaultValue),
    undefined,
    undefined,
    undefined,
    patchHzEncoder('formfreq', 'formfreq', defaultValue),
];

const main = {
    encoders,
};

export default new SynthData(
    'sik-goo',
    `SynthDef("sik-goo", { |out, freq = 440, formfreq = 100, gate = 1.0, bwfreq = 800, amp = 1|
      var x;
      x = Formant.ar(
          SinOsc.kr(0.02, 0, 10, freq),
          formfreq,
          bwfreq
      );
      x = EnvGen.kr(Env.adsr, gate, Latch.kr(gate, gate), doneAction: 2) * x;
      Out.ar(out, x * amp);
  })`,
    [main],
    defaultValue,
);
