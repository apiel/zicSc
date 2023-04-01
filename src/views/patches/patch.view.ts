import { clear, drawText } from 'zic_node_ui';
import { MidiMsg } from '../../midi';
import { currentPatchId, getPatch } from '../../patch';
import { color } from '../../style';
import { RenderOptions, viewPadPressed } from '../../view';
import { patchPadMidiHandler } from '../controller/patchController';
import { sequencePlayStopMidiHandler, sequenceSelectMidiHandler } from '../controller/sequencerController';
import { patchMenu, patchMenuHandler } from './patch.menu';
import { synthsMap } from './synths';
import { Encoders, encodersHandler, encodersView } from '../../layout/encoders.layout';
import { renderMessage } from '../../draw/drawMessage';
import { pageMidiHandler } from '../controller/pageController';
import { drawPatchTitle } from './draw';
import { patchEncoder, synthEncoder } from './encoders';

export function getPatchView(patch = getPatch(currentPatchId)) {
    console.log('patch', currentPatchId, patch);
    if (!patch.synth) {
        return;
    }
    return synthsMap.get(patch.synth);
}

const defaultEncoder: Encoders = [
    patchEncoder,
    synthEncoder,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
];

export async function patchView({ controllerRendering }: RenderOptions = {}) {
    const patch = getPatch(currentPatchId);
    const view = getPatchView(patch);

    // if (controllerRendering) {
    //     sequencerController();
    //     if (viewPadPressed) {
    //         bankController();
    //     } else {
    //         patchController(view?.views.length, view?.currentView);
    //     }
    // }

    clear(color.background);

    let header: () => void = () => drawPatchTitle(patch.name);
    let encoders: Encoders = defaultEncoder;

    if (view) {
        encoders = view.data.encoders;
        if (view.data.header) {
            header = view.data.header;
        }
    }

    encodersView(encoders);
    header();

    patchMenu();
    renderMessage();
}

export async function patchMidiHandler(midiMsg: MidiMsg) {
    const menuStatus = await patchMenuHandler(midiMsg);
    if (menuStatus !== false) {
        return menuStatus !== undefined;
    }

    if (viewPadPressed && (await sequencePlayStopMidiHandler(midiMsg))) {
        return true;
    }

    if (sequenceSelectMidiHandler(midiMsg) || patchPadMidiHandler(midiMsg)) {
        return true;
    }

    const view = getPatchView();
    if (!view) {
        return encodersHandler(defaultEncoder, midiMsg);
    }

    if (pageMidiHandler(midiMsg, view.changeView.bind(view))) {
        return true;
    }

    return encodersHandler(view.data.encoders, midiMsg);
}
