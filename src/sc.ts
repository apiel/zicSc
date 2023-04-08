import lang from '@supercollider/lang';
import ServerPlus, { Group, Synth } from '@supercollider/server-plus';
import { exec } from 'child_process';
import { Note } from 'tonal';
import { promisify } from 'util';
import { Patch, getPatch, patches } from './patch';
import { Sequence, Step } from './sequence';
import { synths, synthsMap } from './views/patches/synths';

const execAsync = promisify(exec);

async function jackConnect() {
    // jack_lsp -c
    await execAsync('jack_connect SuperCollider:out_1 system:playback_1');
    await execAsync('jack_connect SuperCollider:out_2 system:playback_2');
}

let client: lang;
let server: ServerPlus;

// interface Params {
//     [name: string]: OscType;
// }

interface SynthNode {
    synth: Synth;
    note: number;
}

const synthNodes: SynthNode[] = [];

export async function noteOn(note: number, velocity: number, patch: Patch) {
    if (server) {
        if (patch.synth) {
            const _synth = synthsMap.get(patch.synth);
            if (_synth?.synthDef) {
                const freq = Note.freq(Note.fromMidi(note)) || 440;
                const synth = await server.synth(_synth.synthDef, { ...patch.params, freq, velocity }, patch.group);
                synthNodes.push({ synth, note });
            }
        }
    }
}

export function noteOff(note: number) {
    if (server) {
        // Loop because sometime some notes stay on...
        for (const node of synthNodes) {
            if (node.note === note) {
                node.synth.set({ gate: 0 });
            }
        }
    }
}

export function setParams({ group, params }: Patch, key: string) {
    if (server) {
        if (group) {
            group.set({ [key]: params[key] });
        }
        // client.interpret(``);
    }
}

function getSynthStep(step: Step) {
    const patch = getPatch(step.patchId);
    let params = '';
    for (const key in patch.params) {
        params += `, \\${key}: { topEnvironment.at(\\patchesParams).patch_${patch.id}.${key} }`;
        // params += `, \\${key}: { ${patch.params[key]} }`;
    }
    return `(\\midinote: ${step.note}, \\instrument: "${patch.synth}", \\dur: 0.25, \\group: ${patch.group?.id}${params})`;
}

export function playScSequence(sequence: Sequence) {
    let steps = '';
    let voice1 = '~voice1 = Pseq([';
    for (let i = 0; i < sequence.stepCount; i++) {
        const step = sequence.steps[i];
        if (step[0]) {
            steps += `~step${i} = PatternProxy(${getSynthStep(step[0])});\n`;
        } else {
            steps += `~step${i} = PatternProxy((\\degree: Rest(), \\dur: 0.25));\n`;
        }
        voice1 += `~step${i},`;
    }
    voice1 += '], inf)';
    const code = `
        (
        topEnvironment;
        ~sequence_${sequence.id}_stop = 0;
        ${steps}

        ~lastStep = PatternProxy(Pseq([
            (\\degree: Rest(), dur: ${(sequence.stepCount - 1) * 0.25}), 
            (\\degree: { "last".postln; if (topEnvironment.at(\\sequence_${
                sequence.id
            }_stop) > 0, { "should stop".postln; topEnvironment.at(\\sequence_${
        sequence.id
    }).stop }); Rest() }, dur: 0.25)
        ], inf));
  
        ~steps = PatternProxy(
            Ppar([
                ${voice1}, 
                ~lastStep,
            ])
        );
        ~sequence_${sequence.id} = ~steps.play;
    )`;
    console.log(code);
    return client.interpret(code);
}

export function stopScSequence(sequence: Sequence) {
    return client.interpret(`~sequence_${sequence.id}_stop = 1`);
}

function getPatchValues(patch: Patch) {
    let paramValues = `\\patch_${patch.id}: (`;
    for (const key in patch.params) {
        paramValues += `\\${key}: ${patch.params[key]},`;
    }
    paramValues += '),';
    return paramValues;
}

export async function sc() {
    // server = await boot();
    // await jackConnect();

    server = new ServerPlus();
    await server.connect();
    client = await lang.boot();

    let patchesParams = 'topEnvironment; ~patchesParams = (';
    for (let patch of patches) {
        const newGroup = await client.interpret(`Group.new;`);
        if (newGroup.string) {
            patch.group = new Group(server, Number((newGroup.string as string).slice(6, -1)));
            // Increase node id to avoid conflict
            server.state.nextNodeID();
        }
        patchesParams += getPatchValues(patch);

        // FIXME remove this
        if (patch.id > 7) {
            break;
        }
    }
    patchesParams += ');';
    // console.log(patchesParams);
    await client.interpret(patchesParams);

    for (const synth of synths) {
        synth.synthDef = await server.synthDef(synth.name, synth.synthDefCode);
    }

    server.receive.subscribe(([type, nodeId, ...msg]: any) => {
        if (type === '/n_end') {
            const index = synthNodes.findIndex(({ synth: { id } }) => id === nodeId);
            if (index !== -1) {
                synthNodes.splice(index, 1);
            }
        }
    });

    // await client.interpret("Pbind(\\note, Pseq([1,2,3,4], 4), \\dur, 0.25).play");
    // setTimeout(async () => {
    //     await client.interpret("(\\instrument: \"bubble\", \\note: 7, \\dur: 0.25).play");
    // }, 2000);

    // server
}
