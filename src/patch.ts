import { readFile, writeFile } from 'fs/promises';

import { PATCH_COUNT, config } from './config';
import { shiftPressed } from './midi';
import { noteOff, noteOn, setParams } from './sc';
import { fileExist, minmax } from './util';
import { Group } from '@supercollider/server-plus';

export let currentPatchId = 0;
export function setCurrentPatchId(id: number) {
    currentPatchId = minmax(id, 0, PATCH_COUNT - 1);
}

export class Patch {
    protected filename: string;
    protected data: { [key: string]: number | string } = {};

    synth?: string;
    name: string = 'Init patch';

    group?: Group;

    setData(key: string, value: number | string) {
        this.data[key] = value;
        setParams(this, key);
    }

    setNumber(
        key: string,
        defaultValue: number,
        direction: number,
        min: number,
        max: number,
        ratio: number = 1,
        shiftRatio?: number,
    ) {
        if (shiftRatio === undefined) {
            shiftRatio = ratio;
        }
        const value = minmax(
            this.getData<number>(key, defaultValue) + direction * (shiftPressed ? shiftRatio : ratio),
            min,
            max,
        );
        this.setData(key, value);
    }

    get params() {
        return this.data;
    }

    noteOn(note: number, velocity: number) {
        if (this.synth) {
            return noteOn(this.synth, note, velocity, this);
        }
    }

    noteOff(note: number) {
        if (this.synth) {
            return noteOff(note);
        }
    }

    getData<T = number | string>(key: string, defaultValue: T): T {
        return (this.data[key] as T) ?? defaultValue;
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
        this.set(patch);
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
