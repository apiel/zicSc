import { clear } from 'zic_node_ui';
import { MidiMsg, MIDI_TYPE } from '../../midi';
import { Patch, currentPatchId, getPatch } from '../../patch';
import { color } from '../../style';
import { RenderOptions, viewPadPressed } from '../../view';
import { patchController, patchPadMidiHandler } from '../controller/patchController';
import { sequencePlayStopMidiHandler, sequenceSelectMidiHandler } from '../controller/sequencerController';
import { patchMenu, patchMenuHandler } from './patch.menu';
import { synthsMap } from './synths';
import { Encoders, encodersHandler, encodersView } from '../../layout/encoders.layout';
import { renderMessage } from '../../draw/drawMessage';
import { pageMidiHandler } from '../controller/pageController';
import { drawPatchTitle } from './draw';
import { patchEncoder, synthEncoder } from './encoders';
import { SynthData } from './synths/SynthData';
import { playSynth } from '../../sc';

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

    // if (controllerRendering) {
    //     sequencerController();
    //     if (viewPadPressed) {
    //         bankController();
    //     } else {
    patchController(view?.views.length, view?.currentView);
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

    const patch = getPatch(currentPatchId);
    const view = getPatchView(patch);
    if (!view) {
        return encodersHandler(defaultEncoder, midiMsg);
    }

    if (await keyboardMidiHandler(midiMsg, patch)) {
        return true;
    }

    if (pageMidiHandler(midiMsg, view.changeView.bind(view))) {
        return true;
    }

    return encodersHandler(view.data.encoders, midiMsg);
}

async function keyboardMidiHandler({ isKeyboard, message: [type, note, velocity] }: MidiMsg, patch: Patch) {
    // if (midiMsg.type === 'noteon' && midiMsg.note === 60) {
    //     return true;
    // }
    if (isKeyboard && patch.synthDef) {
        if (type === MIDI_TYPE.KEY_PRESSED) {
            // view.keyboard.noteOn(note);
            await playSynth(patch.synthDef);
            return true;
        }
        if (type === MIDI_TYPE.KEY_RELEASED) {
            // view.keyboard.noteOff(note);
            return true;
        }
    }
    return false;
}