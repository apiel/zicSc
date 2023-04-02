import ServerPlus, { Synth, boot } from '@supercollider/server-plus';
// import {} from '@supercollider/';
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
const synthNodes: number[] = [];

export async function playSynth(name: string) {
    if (server) {
        const synthData = synthsMap.get(name);
        if (synthData && synthData.synthDef) {
            let synth = await server.synth(synthData.synthDef);
            synthNodes.push(synth.id);
        }
    }
}

// TODO should generate sequencer and load all synth for the sequence
// export async function startSequence
// export async function stopSequence

export async function sc() {
    server = await boot();
    await jackConnect();

    for (const synth of synths) {
        synth.synthDef = await server.synthDef(synth.name, synth.synthDefCode);
    }

    server.receive.subscribe(([type, nodeId, ...msg]: any) => {
        if (type === '/n_end') {
            const index = synthNodes.indexOf(nodeId);
            if (index !== -1) {
                synthNodes.splice(index, 1);
            }
        }
    });
}
