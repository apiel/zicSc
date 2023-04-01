import ServerPlus, { SynthDef, boot } from '@supercollider/server-plus';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function jackConnect() {
    // jack_lsp -c
    await execAsync('jack_connect SuperCollider:out_1 system:playback_1');
    await execAsync('jack_connect SuperCollider:out_2 system:playback_2');
}

let server: ServerPlus;

export async function addSynth(defName: string, sourceCode: string) {
    if (server) {
        // This doesnt seem to add the synth ^^
        return server.synthDef(defName, sourceCode);
        // should return server.synth(def); instead!!
        // but each patch must have an envelop: https://doc.sccode.org/Classes/MIDIIn.html#example%20with%20sound

        // But should we create envelop by default???
        // or let it up to the patch?

        // however creating synth for every patch is maybe not a good idea!!!
    }
}

export async function playSynth(def: SynthDef) {
    if (server) {
        server.synth(def);
    }
}

export async function sc() {
    server = await boot();
    await jackConnect();

    // const def = await server.synthDef(
    //     'bubbles',
    //     `
    //         SynthDef("bubbles", { arg out=0;
    //           var f, zout;
    //           var wobble=Rand(0.0, 10.0), innerWobble=Rand(0.0, 16.0), releaseTime=Rand(2.0, 6.0);
    //           f = LFSaw.kr(wobble, 0, 24, LFSaw.kr([innerWobble, innerWobble / 1.106], 0, 3, 80)).midicps;
    //           zout = CombN.ar(SinOsc.ar(f, 0, 0.04), 0.2, 0.2, 4);  // echoing sine wave
    //           zout = zout * EnvGen.kr(Env.linen(releaseTime: releaseTime), doneAction: 2);
    //           Out.ar(out, zout);
    //         });
    //       `,
    // );

    // const def = await server.synthDef(
    //     'psykick',
    //     `SynthDef("psykick", { arg out=0, dur = 0.15, atk = 0.005, amp = 1;
    //         var zout = SinOsc.ar(
    //             EnvGen.ar(
    //               Env(
    //                 NamedControl.kr(\\freq_l, [2960, 70, 90]),
    //                 NamedControl.kr(\\freq_d, [0.07, 0.2]),
    //                 NamedControl.kr(\\freq_c, [-13, -1]),
    //               )
    //             ),
    //             mul:amp * EnvGen.ar(
    //                 Env.perc( atk, dur - atk, curve: NamedControl.kr(\\amp_c, [-1, 6])),
    //                 doneAction: 2
    //             );
    //         );
    //         Out.ar(out, zout);
    //     })`,
    // );

    // setInterval(() => {
    // server.synth(def);
    // }, 4000);
}
