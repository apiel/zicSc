import ServerPlus, { Group, Synth, boot } from '@supercollider/server-plus';
import lang from '@supercollider/lang';
import { OscType } from '@supercollider/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Note } from 'tonal';
import { synths, synthsMap } from './views/patches/synths';
import { Sequence, Step } from './sequence';
import { Patch, getPatch, patches } from './patch';

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

export async function noteOn(name: string, note: number, velocity: number, patch: Patch) {
    if (server) {
        const synthData = synthsMap.get(name);
        if (synthData && synthData.synthDef) {
            const freq = Note.freq(Note.fromMidi(note)) || 440;
            const synth = await server.synth(synthData.synthDef, { ...patch.params, freq, velocity }, patch.group);
            synthNodes.push({ synth, note });
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
    if (server && group) {
        group.set({ [key]: params[key] });
    }
}

function getSynthStep(step: Step) {
    const patch = getPatch(step.patchId);
    return `(\\midinote: ${step.note}, \\instrument: "${patch.synth}", \\dur: 0.25, \\group: ${patch.group?.id})`;
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
    const code = `(
        ${steps}

        ~lastStep = PatternProxy(Pseq([
            (\\degree: Rest(), dur: ${(sequence.stepCount - 1) * 0.25}), 
            (\\degree: { "last".postln; if (s > 0, { "should stop".postln; p.stop }); Rest() }, dur: 0.25)
        ], inf));
  
        ~steps = PatternProxy(
            Ppar([
                ${voice1}, 
                ~lastStep,
            ])
        );
    
        s = 0;
        p = ~steps.play;
    )`;
    console.log(code);
    return client.interpret(code);
}

export function stopScSequence(sequence: Sequence) {
    return client.interpret('s = 1');
}

export async function sc() {
    // server = await boot();
    // await jackConnect();

    server = new ServerPlus();
    await server.connect();
    client = await lang.boot();

    for (let patch of patches) {
        const newGroup = await client.interpret(`Group.new;`);
        if (newGroup.string) {
            patch.group = new Group(server, Number((newGroup.string as string).slice(6, -1)));
            // Increase node id to avoid conflict
            server.state.nextNodeID();
        }
    }

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
