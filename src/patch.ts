import { readFile, writeFile } from 'fs/promises';
import { SynthDef } from '@supercollider/server-plus';

import { config } from './config';
import { fileExist, minmax } from './util';
import { PATCH_COUNT } from './config';
import { synthsMap } from './views/patches/synths';
import { addSynth } from './sc';

export let currentPatchId = 0;
export function setCurrentPatchId(id: number) {
    currentPatchId = minmax(id, 0, PATCH_COUNT - 1);
}

export class Patch {
    protected filename: string;

    synth?: string;
    synthDef?: SynthDef;
    name: string = 'Init patch';
    floats: { [id: number]: number } = {};
    strings: { [id: number]: string } = {};

    setString(stringId: number, value: string) {
        this.strings[stringId] = value;

        // TODO send msg to scserver
        // Might now even need to check if it is playing, because as long we edit it, we should load it...
        // const sequences = getPlayingSequencesForPatch(this.id);
        // for (const { trackId } of sequences) {
        //     // trackId !== undefined && trackSetString(trackId, value, stringId);
        // }
    }

    setNumber(floatId: number, value: number) {
        this.floats[floatId] = value;

        // TODO send msg to scserver
        // const sequences = getPlayingSequencesForPatch(this.id);
        // for (const { trackId } of sequences) {
        //     // trackId !== undefined && trackSetNumber(trackId, value, floatId);
        // }
    }

    constructor(public readonly id: number) {
        this.filename = `${this.id.toString().padStart(3, '0')}.json`;
    }

    save() {
        const patchFile = `${config.path.patches}/${this.filename}`;
        return writeFile(patchFile, JSON.stringify(this, null, 2));
    }

    async load() {
        // if (this.synthDef) { remove ??? }

        const patchFile = `${config.path.patches}/${this.filename}`;
        if (!(await fileExist(patchFile))) {
            // TODO might want to assign default patch
            // this.set(getPatch(0??));
            this.name = 'Init patch';

            return;
        }
        const patch = JSON.parse((await readFile(patchFile)).toString());
        Object.assign(this, patch);

        if (this.synth) {
            const synth = synthsMap.get(this.synth);
            if (synth) {
                const name = `patch_${this.id}`;
                const def = synth.synthDef.replace(/SynthDef\([0-9a-zA-Z\"\-_\\]+,/g, `SynthDef("${name}",`);
                this.synthDef = await addSynth(name, def);
            }
        }
    }

    set({ id, ...patch }: Partial<Patch>) {
        Object.assign(this, patch);
    }
}

export const patches: Patch[] = Array(PATCH_COUNT)
    .fill(undefined)
    .map((_, id) => new Patch(id));

export const getPatch = (patchId: number) => {
    // const id = minmax(patchId, 0, patches.length - 1);
    return patches[patchId];
};

export async function loadPatches() {
    try {
        for (const patch of patches) {
            await patch.load();
        }
    } catch (error) {
        console.error(`Error while loading patche engines`, error);
    }
}

export async function savePatchAs(patch: Patch, as: string) {
    const isUnique = patches.every((p) => p.name !== as);
    if (!isUnique) {
        throw new Error(`Patch name ${as} is not unique`);
    }
    let nextId = patches.findIndex((p) => p.synth === undefined);
    if (nextId === -1) {
        throw new Error(`No more free patch`);
    }
    patches[nextId].set({ ...patch, name: as });
    await patches[nextId].save();
}
