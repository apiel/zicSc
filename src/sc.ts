import ServerPlus, { Group, Synth, boot } from '@supercollider/server-plus';
import lang from '@supercollider/lang';
import { OscType } from '@supercollider/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Note } from 'tonal';
import { synths, synthsMap } from './views/patches/synths';
import { Sequence } from './sequence';
import { Patch, patches } from './patch';

const execAsync = promisify(exec);

async function jackConnect() {
    // jack_lsp -c
    await execAsync('jack_connect SuperCollider:out_1 system:playback_1');
    await execAsync('jack_connect SuperCollider:out_2 system:playback_2');
}

let client: lang;
let server: ServerPlus;
let groups: Group[] = [];

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
            const synth = await server.synth(synthData.synthDef, { ...patch.params, freq, velocity }, groups[patch.id]);
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

export function setParams({ id, params }: Patch, key: string) {
    if (server) {
        groups[id].set({ [key]: params[key] });
    }
}

export function playScSequence(sequence: Sequence) {
    let steps = '';
    let voice1 = '~voice1 = Pseq([';
    for (let i = 0; i < sequence.stepCount; i++) {
        const step = sequence.steps[i];
        if (step[0]) {
            // FIXME
            steps += `~step${i} = PatternProxy((\\midinote: ${step[0].note}, \\instrument: "psykick", \\dur: 0.25));\n`;
        } else {
            steps += `~step${i} = PatternProxy((\\degree: Rest(), \\dur: 0.25));\n`;
        }
        voice1 += `~step${i},`;
    }
    voice1 += '], inf)';
    // const code = voice1 + '.play; )';
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

// TODO should generate sequencer and load all synth for the sequence
// export async function startSequence
// export async function stopSequence

// should nodes id be grouped by patches?
// should there be a node timeout?

export async function sc() {
    // server = await boot();
    // await jackConnect();

    server = new ServerPlus();
    await server.connect();
    client = await lang.boot();

    // group = await server.group();
    for (let { id } of patches) {
        // @supercollider/server-plus adds these methods:
        // Create a group and wait for confirmation. Nice and simple
        // groups[id] = await server.group(); // Doesnt work

        // const groupNodeID = server.state.nextNodeID();
        // server.send.msg(['/g_new', id + 2000]); // This work but it's ugly
        // Because supercollider js doesnt work properly with nextNodeID...
        // so instead to create group using osc messages, let's the sclang taking care of it!!

        const newGroup = await client.interpret(`Group.new;`);
        if (newGroup.string) {
            groups[id] = new Group(server, Number((newGroup.string as string).slice(6, -1)));
        }

        if (id > 10) {
            break;
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
