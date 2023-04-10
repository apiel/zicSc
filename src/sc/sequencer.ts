import { getPatch } from '../patch';
import { Sequence } from '../sequence';
import { noteOff, noteOn } from './synth';

let bpm = 120;
// There is 4 quarter per beat, and 60 beat per minutes (bpm), but tempo is in ms
const getTempo = () => (60 / (bpm * 4)) * 1000;
let tempo = getTempo();

interface SequencerItem {
    sequence: Sequence;
    currentStep: number;
    // next?: Sequence;
}

const sequencerItems: SequencerItem[] = [];

function loop() {
    setTimeout(loop, tempo);
    beatQuarter(); // Don't await!!
}
loop();

async function beatQuarter() {
    for (const index in sequencerItems) {
        const item = sequencerItems[index];
        const steps = item.sequence.steps[item.currentStep];
        for (const step of steps) {
            if (step?.note) {
                await noteOn(step.note, step.velocity, getPatch(step.patchId));
                setTimeout(() => {
                    // FIXME: cannot stop all notes
                    noteOff(step.note);
                }, tempo);
            }
        }
        item.currentStep++;
        if (item.currentStep >= item.sequence.stepCount) {
            if (item.sequence.playing) {
                item.currentStep = 0;
            } else {
                sequencerItems.splice(Number(index), 1);
            }
        }
    }
}

export function setBpm(newBpm: number) {
    bpm = newBpm;
    tempo = getTempo();
}

export function addToSequencer(sequence: Sequence) {
    sequencerItems.push({
        sequence,
        currentStep: 0,
    });
}

export function stopNext(sequence: Sequence) {}
