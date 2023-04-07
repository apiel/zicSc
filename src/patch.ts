import { readFile, writeFile } from 'fs/promises';

import { Group } from '@supercollider/server-plus';
import { PATCH_COUNT, config } from './config';
import { shiftPressed } from './midi';
import { noteOff, noteOn, setParams } from './sc';
import { fileExist, minmax } from './util';
import { synthsMap } from './views/patches/synths';

export let currentPatchId = 0;
export function setCurrentPatchId(id: number) {
    currentPatchId = minmax(id, 0, PATCH_COUNT - 1);
}

export class Patch {
    protected _filename: string;
    // Keep without _underscore to be saved in json
    protected data: { [key: string]: number | string } = {};
    protected _group?: Group;
    protected _synth?: string;

    name: string = 'Init patch';

    get synth() {
        return this._synth;
    }

    set synth(synth: string | undefined) {
        this._synth = synth;
        if (synth) {
            const _synth = synthsMap.get(synth);
            this.data = { ..._synth?.defaultValue, ...this.data };
        }
    }

    get group() {
        return this._group;
    }

    set group(group: Group | undefined) {
        this._group = group;
    }

    get params() {
        return this.data;
    }

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

    noteOn(note: number, velocity: number) {
        if (this.synth) {
            return noteOn(note, velocity, this);
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

    get id() {
        return this._id;
    }

    constructor(protected readonly _id: number) {
        this._filename = `${this._id.toString().padStart(3, '0')}.json`;
    }

    save() {
        const patchFile = `${config.path.patches}/${this._filename}`;
        return writeFile(
            patchFile,
            JSON.stringify(
                {
                    ...this,
                    synth: this.synth,
                },
                (key, value) => (key[0] === '_' ? undefined : value),
                2,
            ),
        );
    }

    async load() {
        // if (this.synthDef) { remove ??? }

        const patchFile = `${config.path.patches}/${this._filename}`;
        if (!(await fileExist(patchFile))) {
            // TODO might want to assign default patch
            // this.set(getPatch(0??));
            this.name = 'Init patch';

            return;
        }
        const patch = JSON.parse((await readFile(patchFile)).toString());
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
