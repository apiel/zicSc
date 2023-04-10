import { Note } from 'tonal';
import { Patch } from '../patch';
import { nodeSet, synthNew } from './cmd';
import { eventClient } from './client';
import { Argument } from 'osc-min';

interface SynthNode {
    id: number;
    note: number;
}

const synthNodes: SynthNode[] = [];

export function watchSynthNodes() {
    // On note off, remove synth node from array
    eventClient.on('/n_end', ([{ value: nodeId }]: Argument[]) => {
        const index = synthNodes.findIndex(({ id }) => id === nodeId);
        if (index !== -1) {
            synthNodes.splice(index, 1);
        }
    });
}

export async function noteOn(note: number, velocity: number, patch: Patch) {
    if (patch.synth) {
        const id = await synthNew(patch.synth, patch.groupId, {
            ...patch.params,
            freq: Note.freq(Note.fromMidi(note)) || 440,
            velocity,
        });
        synthNodes.push({ note, id });
    }
}

export function noteOff(note: number) {
    // Loop because sometime some notes stay on...
    for (const node of synthNodes) {
        if (node.note === note) {
            // should we await?
            nodeSet(node.id, 'gate', 0);
        }
    }
}

export function setParams({ groupId, params }: Patch, key: string) {
    // FIXME ??
    // client.interpret(`topEnvironment.at(\\patchesParams).patch_${id}.${key} = ${params[key]}`);

    // TODO here we could look if the synth is playing...
    if (groupId) {
        return nodeSet(groupId, key, params[key]);
    }
}
