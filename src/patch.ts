import { readFile, writeFile } from 'fs/promises';
import { config } from './config';
import { getPlayingSequencesForPatch } from './sequence';
import { fileExist, minmax } from './util';
import { PATCH_COUNT } from './config';

export let currentPatchId = 0;
export function setCurrentPatchId(id: number) {
    currentPatchId = minmax(id, 0, PATCH_COUNT - 1);
}

export class Patch {
    protected filename: string;

    isModified: boolean = false;
    name: string = 'Init patch';
    floats: { [id: number]: number } = {};
    strings: { [id: number]: string } = {};
    cc: { [id: number]: number } = {};

    setString(stringId: number, value: string) {
        this.isModified = true;
        this.strings[stringId] = value;

        const sequences = getPlayingSequencesForPatch(this.id);
        for (const {trackId} of sequences) {
            // trackId !== undefined && trackSetString(trackId, value, stringId);
            // TODO send msg to scserver
        }
    }

    setNumber(floatId: number, value: number) {
        this.isModified = true;
        this.floats[floatId] = value;

        const sequences = getPlayingSequencesForPatch(this.id);
        for (const {trackId} of sequences) {
            // trackId !== undefined && trackSetNumber(trackId, value, floatId);
            // TODO send msg to scserver
        }
    }

    setCc(ccId: number, value: number) {
        this.isModified = true;
        this.cc[ccId] = value;

        const sequences = getPlayingSequencesForPatch(this.id);
        for (const {trackId} of sequences) {
            // trackId !== undefined && trackCc(trackId, value, ccId);
            // TODO send msg to scserver
        }
    }

    constructor(public readonly id: number) {
        this.filename = `${(this.id).toString().padStart(3, '0')}.json`;
    }

    save() {
        const patchFile = `${config.path.patches}/${this.filename}`;
        return writeFile(patchFile, JSON.stringify(this, null, 2));
    }

    async load() {
        const patchFile = `${config.path.patches}/${this.filename}`;
        if (!(await fileExist(patchFile))) {
            this.isModified = false;
            // TODO might want to assign default patch
            // right now get the first patch from the engine
            this.set(getPatch(0));
            this.name = 'Init patch';

            return;
        }
        const patch = JSON.parse((await readFile(patchFile)).toString());
        this.isModified = true;
        Object.assign(this, patch);
    }

    set({ id, ...patch}: Partial<Patch>) {
        Object.assign(this, patch);
        this.isModified = true;
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
    let nextId = patches.findIndex((p) => p.isModified === false);
    if (nextId === -1) {
        throw new Error(`No more free patch`);
    }
    patches[nextId].set({ ...patch, name: as });
    await patches[nextId].save();
}
