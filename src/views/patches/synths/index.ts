import psykick from './psykick';
import bubble from './bubble';
import sikGoo from './sik-goo';
import gabberkick from './gabberkick';
import hoover from './hoover';
import sc303 from './sc303';

export const synths = [sikGoo, psykick, bubble, gabberkick, hoover, sc303];
export const synthsMap = new Map(synths.map((synth) => [synth.name, synth]));
export const synthsNames = Array.from(synthsMap.keys());
