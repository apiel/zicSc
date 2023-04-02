import { sendMidiMessage } from 'zic_midi';
import { MIDI_TYPE, MidiMsg, midiOutController } from '../../midi';
import { akaiApcKey25 } from '../../midi/akaiApcKey25';
import { padBanks } from './sequencerController';
import { getPatchView } from '../patches/patch.view';
import { patches } from '../../patch';
import { padSeq } from './sequencerController';
import { synths } from '../patches/synths';
import { minmax } from '../../util';

export function patchViewPageController(count = 0, active = 0) {
    if (midiOutController?.port) {
        padBanks.forEach((pad, i) => {
            sendMidiMessage(midiOutController!.port, [
                i === active ? akaiApcKey25.padMode.on100pct : akaiApcKey25.padMode.on10pct,
                pad,
                i < count ? 0x03 : 0x00,
            ]);
        });
    }
}

export function patchPagePadMidiHandler({ isController, message: [type, padKey] }: MidiMsg) {
    if (isController) {
        if (type === MIDI_TYPE.KEY_RELEASED) {
            const index = padBanks.findIndex((p) => p === padKey);
            if (index !== -1) {
                getPatchView()?.setView(index);
                return true;
            }
        }
    }
    return false;
}

let patchListStart = 0;

export function updatePatchListStart(direction: number) {
    if (direction === 1) {
        patchListStart += padSeq.length;
    } else {
        patchListStart -= padSeq.length;
    }
    patchListStart = minmax(patchListStart, 0, patches.length - padSeq.length);
}

export function patchListController() {
    if (midiOutController?.port) {
        patches.slice(patchListStart, patchListStart + padSeq.length).forEach((patch, i) => {
            const padColor = synths.findIndex((s) => s.name === patch.synth) % 120;
            sendMidiMessage(midiOutController!.port, [akaiApcKey25.padMode.on100pct, padSeq[i], padColor + 1]);
        });
    }
}

export function patchListPageController() {
    if (midiOutController?.port) {
        console.log('patchListPageController');
        padBanks.forEach((pad) => {
            sendMidiMessage(midiOutController!.port, [akaiApcKey25.padMode.on100pct, pad, 0x00]);
        });
        const active = patchListStart / padSeq.length;
        sendMidiMessage(midiOutController!.port, [akaiApcKey25.padMode.on100pct, padBanks[active], 0x04]);
    }
}

export function patchListPageMidiHandler({ isController, message: [type, padKey] }: MidiMsg) {
    if (isController) {
        if (type === MIDI_TYPE.KEY_RELEASED) {
            const index = padBanks.findIndex((p) => p === padKey);
            if (index !== -1) {
                patchListStart = index * padSeq.length;
                return true;
            }
        }
    }
    return false;
}