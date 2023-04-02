import { MidiMsg, MIDI_TYPE } from '../../midi';
import { akaiApcKey25 } from '../../midi/akaiApcKey25';

export let pagePressed = false;

export function pageMidiHandler({ isController, message: [type, padKey] }: MidiMsg, changePage: (direction: number) => void) {
    if (isController) {
        switch (padKey) {
            case akaiApcKey25.pad.down: {
                pagePressed = type === MIDI_TYPE.KEY_PRESSED;
                if (type === MIDI_TYPE.KEY_PRESSED) {
                    changePage(+1);
                }
                return true;
            }
            case akaiApcKey25.pad.up: {
                pagePressed = type === MIDI_TYPE.KEY_PRESSED;
                if (type === MIDI_TYPE.KEY_PRESSED) {
                    changePage(-1);
                }
                return true;
            }
        }
    }
    return false;
}
