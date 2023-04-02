import { Encoders } from '../../../../layout/encoders.layout';
import { SynthData } from '../SynthData';

const encoders: Encoders = [
  undefined,
  undefined,
  undefined,
  undefined,
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
    `SynthDef("sik-goo", { |out, freq = 440, formfreq = 100, gate = 1.0, bwfreq = 800|
      var x;
      x = Formant.ar(
          SinOsc.kr(0.02, 0, 10, freq),
          formfreq,
          bwfreq
      );
      x = EnvGen.kr(Env.adsr, gate, Latch.kr(gate, gate)) * x;
      Out.ar(out, x);
  })`,
    [main],
);
