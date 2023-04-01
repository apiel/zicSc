import psykick from './psykick';

export const synths = [psykick];

export const synthsMap = new Map(synths.map((synth) => [synth.name, synth]));
