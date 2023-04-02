import { Encoders } from '../../../layout/encoders.layout';
import { currentPatchId, getPatch } from '../../../patch';
import { SynthData } from './SynthData';

const d = {
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
    {
        node: {
            title: 'minReleaseTime',
            getValue: () => getPatch(currentPatchId).getData('minReleaseTime', d.minReleaseTime).toFixed(1).toString(),
            unit: 'seconds',
        },
        handler: async (direction) => {
            const patch = getPatch(currentPatchId);
            const max = patch.getData('maxReleaseTime', d.maxReleaseTime);
            patch.setNumber('minReleaseTime', d.minReleaseTime, direction, 0.5, max, 0.5);
            return true;
        },
    },
    {
        node: {
            title: 'maxReleaseTime',
            getValue: () => getPatch(currentPatchId).getData('maxReleaseTime', d.maxReleaseTime).toFixed(1).toString(),
            unit: 'seconds',
        },
        handler: async (direction) => {
            const patch = getPatch(currentPatchId);
            const min = patch.getData('minReleaseTime', d.minReleaseTime);
            patch.setNumber('maxReleaseTime', d.maxReleaseTime, direction, min, 10, 0.5);
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
    'bubble',
    `SynthDef("bubble", { arg out=0, minReleaseTime=2.0, maxReleaseTime=6.0, minWobble=0.0, maxWobble=10.0, minInnerWooble=0.0, maxInnerWobble=16.0;
      var f, zout;
      var wobble=Rand(minWobble, maxWobble);
      var innerWobble=Rand(minInnerWooble, maxInnerWobble);
      var releaseTime=Rand(minReleaseTime, maxReleaseTime);
      f = LFSaw.kr(wobble, 0, 24, LFSaw.kr([innerWobble, innerWobble / 1.106], 0, 3, 80)).midicps;
      zout = CombN.ar(SinOsc.ar(f, 0, 0.04), 0.2, 0.2, 4);  // echoing sine wave
      zout = zout * EnvGen.kr(Env.linen(releaseTime: releaseTime), doneAction: 2);
      Out.ar(out, zout);
  });`,
    [main],
);
