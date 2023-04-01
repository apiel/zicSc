import { SynthData } from '../SynthData';
import { psykickMain } from './psykickMain';

export default new SynthData(
    'psykick',
    `SynthDef("psykick", { arg out=0, dur = 0.15, atk = 0.005, amp = 1;
        var zout = SinOsc.ar(
            EnvGen.ar(
              Env(
                NamedControl.kr(\\freq_l, [2960, 70, 90]),
                NamedControl.kr(\\freq_d, [0.07, 0.2]),
                NamedControl.kr(\\freq_c, [-13, -1]),
              )
            ),
            mul:amp * EnvGen.ar(
                Env.perc( atk, dur - atk, curve: NamedControl.kr(\\amp_c, [-1, 6])),
                doneAction: 2
            );	
        );
        Out.ar(out, zout);
    })`,
    [psykickMain],
);
