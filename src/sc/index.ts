import { Note } from 'tonal';
import { Patch, getPatch, patches } from '../patch';
import { Sequence, Step } from '../sequence';
import { synths, synthsMap } from '../synths';
import { event, init, send } from './client';
import { defLoadDir, groupNew, nodeSet, synthNew } from './cmd';
import { Argument } from 'osc-min';

interface SynthNode {
    id: number;
    note: number;
}

const synthNodes: SynthNode[] = [];

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
            nodeSet(node.id, 'gate', 0);
        }
    }
}

export function setParams({ groupId, params, id }: Patch, key: string) {
    // if (server) {
    //     if (group) {
    //         group.set({ [key]: params[key] });
    //     }
    //     client.interpret(`topEnvironment.at(\\patchesParams).patch_${id}.${key} = ${params[key]}`);
    // }
}

function getSynthStep(step: Step) {
    const patch = getPatch(step.patchId);
    let params = '';
    for (const key in patch.params) {
        params += `, \\${key}: { topEnvironment.at(\\patchesParams).patch_${patch.id}.${key} }`;
        // params += `, \\${key}: { ${patch.params[key]} }`;
    }
    return `(\\midinote: ${step.note}, \\instrument: "${patch.synth}", \\dur: 0.25, \\group: ${patch.groupId}${params})`;
}

export function playScSequence(sequence: Sequence) {
    // let steps = '';
    // let voice1 = '~voice1 = Pseq([';
    // for (let i = 0; i < sequence.stepCount; i++) {
    //     const step = sequence.steps[i];
    //     if (step[0]) {
    //         steps += `~step${i} = PatternProxy(${getSynthStep(step[0])});\n`;
    //     } else {
    //         steps += `~step${i} = PatternProxy((\\degree: Rest(), \\dur: 0.25));\n`;
    //     }
    //     voice1 += `~step${i},`;
    // }
    // voice1 += '], inf)';
    // const code = `
    //     (
    //     topEnvironment;
    //     ~sequence_${sequence.id}_stop = 0;
    //     ${steps}
    //     ~lastStep = PatternProxy(Pseq([
    //         (\\degree: Rest(), dur: ${(sequence.stepCount - 1) * 0.25}),
    //         (\\degree: { "last".postln; if (topEnvironment.at(\\sequence_${
    //             sequence.id
    //         }_stop) > 0, { "should stop".postln; topEnvironment.at(\\sequence_${
    //     sequence.id
    // }).stop }); Rest() }, dur: 0.25)
    //     ], inf));
    //     ~steps = PatternProxy(
    //         Ppar([
    //             ${voice1},
    //             ~lastStep,
    //         ])
    //     );
    //     ~sequence_${sequence.id} = ~steps.play;
    // )`;
    // console.log(code);
    // return client.interpret(code);
}

export function stopScSequence(sequence: Sequence) {
    // return client.interpret(`~sequence_${sequence.id}_stop = 1`);
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
    await init();

    await defLoadDir();
    console.log('Synth loaded...');

    for (let patch of patches) {
        patch.groupId = await groupNew();
    }

    // On note off, remove synth node from array
    event.on('/n_end', ([{ value: nodeId }]: Argument[]) => {
        const index = synthNodes.findIndex(({ id }) => id === nodeId);
        if (index !== -1) {
            synthNodes.splice(index, 1);
        }
    });
}
