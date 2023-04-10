import { patches } from '../patch';
import { init } from './client';
import { defLoadDir, groupNew } from './cmd';
import { loop } from './sequencer';
import { watchSynthNodes } from './synth';

export async function sc() {
    await init();

    await defLoadDir();
    console.log('Synth loaded...');

    for (let patch of patches) {
        patch.groupId = await groupNew();
    }

    watchSynthNodes();

    // Only start loop once sequences are ready
    await loop();
}
