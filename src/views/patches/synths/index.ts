import psykick from './psykick';
import bubble from './bubble';
import sikGoo from './sik-goo';
import gabberkick from './gabberkick';

export const synths = [
    sikGoo, 
    psykick, 
    bubble, 
    gabberkick,
];
export const synthsMap = new Map(synths.map((synth) => [synth.name, synth]));
export const synthsNames = Array.from(synthsMap.keys());
