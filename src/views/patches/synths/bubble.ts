import { Encoders } from '../../../layout/encoders.layout';
import { patchNumberEncoder } from '../encoders';
import { SynthData } from './SynthData';

const defaultValue = {
    minReleaseTime: 2,
    maxReleaseTime: 6,
    minWobble: 0,
    maxWobble: 10,
    minInnerWooble: 0,
    maxInnerWobble: 16,
};

const encoders: Encoders = [
    undefined,
    undefined,
    patchNumberEncoder('minReleaseTime', 'Min release time', defaultValue, 0.5, 'maxReleaseTime', {
        unit: 'seconds',
        ratio: 0.5,
    }),
    patchNumberEncoder('maxReleaseTime', 'Max release time', defaultValue, 'minReleaseTime', 10, {
        unit: 'seconds',
        ratio: 0.5,
    }),
    patchNumberEncoder('minWobble', 'Min wobble', defaultValue, 0.5, 'maxWobble', {
        unit: 'Hz',
        ratio: 0.5,
    }),
    patchNumberEncoder('maxWobble', 'Max wobble', defaultValue, 'minWobble', 10, {
        unit: 'Hz',
        ratio: 0.5,
    }),
    patchNumberEncoder('minInnerWooble', 'Min inner wobble', defaultValue, 0.5, 'maxInnerWobble', {
        unit: 'Hz',
        ratio: 0.5,
    }),
    patchNumberEncoder('maxInnerWobble', 'Max inner wobble', defaultValue, 'minInnerWooble', 10, {
        unit: 'Hz',
        ratio: 0.5,
    }),
];

const main = {
    encoders,
};

export default new SynthData(
    'bubble',
    `SynthDef("bubble", { arg out=0, minReleaseTime=2.0, maxReleaseTime=6.0, minWobble=0.0, maxWobble=10.0, minInnerWooble=0.0, maxInnerWobble=16.0;
      var f, zout;
      var wobble=Rand(minWobble, maxWobble);
      var innerWobble=Rand(minInnerWooble, maxInnerWobble);
      var releaseTime=Rand(minReleaseTime, maxReleaseTime);
      f = LFSaw.kr(wobble, 0, 24, LFSaw.kr([innerWobble, innerWobble / 1.106], 0, 3, 80)).midicps;
      zout = CombN.ar(SinOsc.ar(f, 0, 0.04), 0.2, 0.2, 4);  // echoing sine wave
      zout = zout * EnvGen.kr(Env.linen(releaseTime: releaseTime), doneAction: Done.freeSelf);
      Out.ar(out, zout);
  });`,
    [main],
);
