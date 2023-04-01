import psykick from './psykick/index';
import bubble from './bubble/index';

export const synths = [psykick, bubble];
export const synthsMap = new Map(synths.map((synth) => [synth.name, synth]));
export const synthsNames = Array.from(synthsMap.keys());
