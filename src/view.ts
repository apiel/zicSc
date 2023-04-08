import { patchMidiHandler, patchView } from './views/patches/patch.view';
import { sequencerMidiHandler, sequencerView } from './views/sequencer/sequencer.view';
import { sequencerEditMidiHandler, sequencerEditView } from './views/sequencerEdit/sequencerEdit.view';
import { View } from './def';
import { MidiMsg, MIDI_TYPE } from './midi';
import { akaiApcKey25 } from './midi/akaiApcKey25';

let view: View = View.Sequencer;
// let view: View = View.Patch; // For the moment let's focus on patches

export const getView = () => view;

export const setView = (newView: View) => {
    if (view === newView) {
        return false;
    }
    view = newView;
    return true;
};

export interface RenderOptions {
    beatRendering?: boolean;
    controllerRendering?: boolean;
}

export const renderView = (options: RenderOptions = {}) => {
    switch (view) {
        case View.Sequencer:
            return sequencerView(options);
        case View.SequencerEdit:
            return sequencerEditView(options);
        case View.Patch:
            return patchView(options);
    }
    // Set view to sequencer if view is not found
    setView(View.Sequencer);
};

export let viewPadPressed = false;
export async function viewMidiHandler(midiMsg: MidiMsg) {
    if (midiMsg.isController) {
        switch (midiMsg.message[1]) {
            case akaiApcKey25.pad.stopAllClips:
                setView(View.Sequencer);
                return true;
            case akaiApcKey25.pad.select:
                viewPadPressed = midiMsg.message[0] === MIDI_TYPE.KEY_PRESSED;
                setView(View.SequencerEdit);
                return true;
            case akaiApcKey25.pad.recArm:
                viewPadPressed = midiMsg.message[0] === MIDI_TYPE.KEY_PRESSED;
                setView(View.Patch);
                return true;
        }
    }

    switch (view) {
        case View.Sequencer:
            return sequencerMidiHandler(midiMsg);
        case View.SequencerEdit:
            return sequencerEditMidiHandler(midiMsg);
        case View.Patch:
            return patchMidiHandler(midiMsg);
    }
}
