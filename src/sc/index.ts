import { patches } from '../patch';
import { init } from './client';
import { defLoadDir, groupNew } from './cmd';
import { watchSynthNodes } from './synth';

export async function sc() {
    await init();

    await defLoadDir();
    console.log('Synth loaded...');

    for (let patch of patches) {
        patch.groupId = await groupNew();
    }

    watchSynthNodes();
}
