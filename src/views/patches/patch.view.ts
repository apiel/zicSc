import { clear } from 'zic_node_ui';
import { renderMessage } from '../../draw/drawMessage';
import { Encoders, encodersHandler, encodersView } from '../../layout/encoders.layout';
import { MIDI_TYPE, MidiMsg } from '../../midi';
import { Patch, currentPatchId, getPatch } from '../../patch';
import { color } from '../../style';
import { RenderOptions, viewPadPressed } from '../../view';
import { pageMidiHandler } from '../controller/pageController';
import {
    patchListController,
    patchListPageController,
    patchListPageMidiHandler,
    patchPagePadMidiHandler,
    patchViewPageController,
    updatePatchListStart,
} from '../controller/patchController';
import { drawPatchTitle } from './draw';
import { patchEncoder, synthEncoder } from './encoders';
import { patchMenu, patchMenuHandler } from './patch.menu';
import { synthsMap } from './synths';

export function getPatchView(patch = getPatch(currentPatchId)) {
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

    if (controllerRendering) {
        if (viewPadPressed) {
            patchListPageController();
        } else {
            patchViewPageController(view?.views.length, view?.currentView);
        }
        patchListController();
    }

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

    if (viewPadPressed) {
        if (patchListPageMidiHandler(midiMsg)) {
        return true;
        }   
    } else {
        if (patchPagePadMidiHandler(midiMsg)) {
            return true;
        }
    }

    const patch = getPatch(currentPatchId);
    const view = getPatchView(patch);
    if (!view) {
        return encodersHandler(defaultEncoder, midiMsg);
    }

    if (await keyboardMidiHandler(midiMsg, patch)) {
        return true;
    }

    if (pageMidiHandler(midiMsg, updatePatchListStart)) {
        return true;
    }

    return encodersHandler(view.data.encoders, midiMsg);
}

async function keyboardMidiHandler({ isKeyboard, message: [type, note, velocity] }: MidiMsg, patch: Patch) {
    if (isKeyboard && patch.synth) {
        if (type === MIDI_TYPE.KEY_PRESSED) {
            await patch.noteOn(note, velocity);
            return true;
        }
        if (type === MIDI_TYPE.KEY_RELEASED) {
            patch.noteOff(note);
            return true;
        }
    }
    return false;
}
