import psykick from './psykick/index';
import bubble from './bubble/index';
import sikGoo from './sik-goo/index';

export const synths = [sikGoo, psykick, bubble];
export const synthsMap = new Map(synths.map((synth) => [synth.name, synth]));
export const synthsNames = Array.from(synthsMap.keys());
