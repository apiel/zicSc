import { ArgumentType } from 'osc-min';
import { event, send } from './client';
import { join } from 'path';

// Would there be a better way to generate unique ids?
let nodeId = 1100;
function getNodeId() {
    return nodeId++;
}

// https://doc.sccode.org/Reference/Server-Command-Reference.html#/g_new
export async function groupNew() {
    const id = getNodeId();
    await send('/g_new', id, 0, 0);
    return id;
}

export interface Params {
    [name: string]: ArgumentType;
}

function flatParams(params: Params) {
    return Object.entries(params).flatMap(([key, value]) => [key, value]);
}

// https://doc.sccode.org/Reference/Server-Command-Reference.html#/s_new
export async function synthNew(synthName: string, groupId: number, params: Params) {
    const id = getNodeId();
    return synthNewWithId(synthName, id, groupId, params);
}
export async function synthNewWithId(synthName: string, id: number, groupId: number, params: Params) {
    await send('/s_new', synthName, id, 0, groupId, ...flatParams(params));
    return id;
}

// https://doc.sccode.org/Reference/Server-Command-Reference.html#/d_loadDir
export async function defLoadDir() {
    const done = new Promise((resolve) => {
        event.once('/done/d_loadDir', resolve);
    });
    await send('/d_loadDir', join(__dirname, '..', 'synths'));
    return done;
}

// https://doc.sccode.org/Reference/Server-Command-Reference.html#/n_set
// nodeID is the synth id or the group id
export function nodeSet(nodeID: number, key: string, value: ArgumentType) {
    return send('/n_set', nodeID, key, value);
}
