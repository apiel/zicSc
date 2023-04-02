import ServerPlus, { Synth, boot } from '@supercollider/server-plus';
import { exec } from 'child_process';
import { promisify } from 'util';
import { synths, synthsMap } from './views/patches/synths';

const execAsync = promisify(exec);

async function jackConnect() {
    // jack_lsp -c
    await execAsync('jack_connect SuperCollider:out_1 system:playback_1');
    await execAsync('jack_connect SuperCollider:out_2 system:playback_2');
}

let server: ServerPlus;
const synthNodes: Synth[] = [];

export async function noteOn(name: string) {
    if (server) {
        const synthData = synthsMap.get(name);
        if (synthData && synthData.synthDef) {
            let synth = await server.synth(synthData.synthDef);
            synthNodes.push(synth);
        }
    }
}

export async function noteOff() {
    if (server) {
        for (const synth of synthNodes) {
            synth.set({ gate: 0 });
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

    for (const synth of synths) {
        synth.synthDef = await server.synthDef(synth.name, synth.synthDefCode);
    }

    server.receive.subscribe(([type, nodeId, ...msg]: any) => {
        if (type === '/n_end') {
            const index = synthNodes.findIndex(({ id }) => id === nodeId);
            if (index !== -1) {
                synthNodes.splice(index, 1);
            }
        }
    });
}
