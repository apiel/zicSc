import { getMidiDevices, MidiError, MidiMessage, sendMidiMessage, setMidiCallback, subscribeMidiInput } from 'zic_midi';
import { render } from 'zic_node_ui';
import { sendTcpMidi } from '../tcp';
import { renderView, viewMidiHandler } from '../view';
import { akaiApcKey25 } from './akaiApcKey25';

export enum MIDI_TYPE {
    KEY_PRESSED = 144,
    KEY_RELEASED = 128,
    CC = 176,
}

export interface MidiMsg extends MidiMessage {
    isController?: boolean;
    isKeyboard?: boolean;
}

const midiDevices = getMidiDevices();
const midiInputController = midiDevices.input.find((input) => input.name.includes('APC Key 25 mk2 C'));
const midiInputKeyboard = midiDevices.input.find((input) => input.name.includes('APC Key 25 mk2 K'));
export const midiOutController = midiDevices.input.find((input) => input.name.includes('APC Key 25 mk2 C'));

export let shiftPressed = false;
export async function handleMidi(data: MidiMsg) {
    sendTcpMidi(data);
    if (data.isController && data.message[1] === akaiApcKey25.pad.shift) {
        const type = data.message[0];
        if (type === MIDI_TYPE.KEY_PRESSED) {
            shiftPressed = true;
        } else if (type === MIDI_TYPE.KEY_RELEASED) {
            shiftPressed = false;
        } // else it's a CC
    }
    if (await viewMidiHandler(data)) {
        renderView({ controllerRendering: true });
        render();
        return;
    }
    console.log(data);
}

setMidiCallback(async (data) => {
    // console.log('setMidiCallback', data);
    if ((data as MidiError).error) {
        console.error('midi error', data);
        return;
    }
    const midiMsg = data as MidiMsg;
    if (data.port === midiInputController?.port) {
        midiMsg.isController = true;
    } else if (data.port === midiInputKeyboard?.port) {
        midiMsg.isKeyboard = true;
    } else {
        return;
    }
    await handleMidi(midiMsg);
});

midiDevices.input.forEach((input) => {
    if (input.name.startsWith('APC Key 25')) {
        subscribeMidiInput(input.port);
    }
});

export function cleanPadMatrix() {
    if (midiOutController !== undefined) {
        akaiApcKey25.padMatrixFlat.forEach((pad) => {
            sendMidiMessage(midiOutController.port, [akaiApcKey25.padMode.on100pct, pad, 0]);
        });
    }
}

// if (midiOutController !== undefined) {
//     for (let i = 0; i < 40; i++) {
//         sendMidiMessage(midiOutController.port, [0x96, 0x00 + i, 0 + i]);
//     }
// }
