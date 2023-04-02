import ServerPlus, { Group, Synth, boot } from '@supercollider/server-plus';
import { OscType } from '@supercollider/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Note } from 'tonal';
import { synths, synthsMap } from './views/patches/synths';

const execAsync = promisify(exec);

async function jackConnect() {
    // jack_lsp -c
    await execAsync('jack_connect SuperCollider:out_1 system:playback_1');
    await execAsync('jack_connect SuperCollider:out_2 system:playback_2');
}

let server: ServerPlus;
let group: Group;

interface SynthNode {
    synth: Synth;
    note: number;
}

const synthNodes: SynthNode[] = [];

export async function noteOn(name: string, note: number, velocity: number) {
    if (server) {
        const synthData = synthsMap.get(name);
        if (synthData && synthData.synthDef) {
            const freq = Note.freq(Note.fromMidi(note)) || 440;
            const synth = await server.synth(synthData.synthDef, { freq }, group);
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

export function set(obj: { [name: string]: OscType }) {
    if (server) {
        // Instead should set to group....
        for (const node of synthNodes) {
            node.synth.set(obj);
        }
    }
}

// TODO should generate sequencer and load all synth for the sequence
// export async function startSequence
// export async function stopSequence

// should nodes id be grouped by patches?
// should there be a node timeout?

export async function sc() {
    server = await boot();
    await jackConnect();

    group = await server.group();

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
}
