import { Encoders } from '../../../layout/encoders.layout';
import { SynthData } from './SynthData';

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
    'bubble',
    `SynthDef("bubble", { arg out=0;
      var f, zout;
      var wobble=Rand(0.0, 10.0), innerWobble=Rand(0.0, 16.0), releaseTime=Rand(2.0, 6.0);
      f = LFSaw.kr(wobble, 0, 24, LFSaw.kr([innerWobble, innerWobble / 1.106], 0, 3, 80)).midicps;
      zout = CombN.ar(SinOsc.ar(f, 0, 0.04), 0.2, 0.2, 4);  // echoing sine wave
      zout = zout * EnvGen.kr(Env.linen(releaseTime: releaseTime), doneAction: 2);
      Out.ar(out, zout);
  });`,
    [main],
);
