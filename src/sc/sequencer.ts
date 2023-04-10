import { Note } from 'tonal';
import { getPatch } from '../patch';
import { Sequence } from '../sequence';
import { synthNew, synthNewWithId } from './cmd';

let bpm = 120;
// There is 4 quarter per beat, and 60 beat per minutes (bpm), but tempo is in ms
const getTempo = () => (60 / (bpm * 4)) * 1000;
let tempo = getTempo();

enum Status {
    PLAYING,
    STARTING_NEXT,
}

interface SequencerItem {
    sequence: Sequence;
    currentStep: number;
    status: Status;
}

const sequencerItems: SequencerItem[] = [];

function loop() {
    setTimeout(loop, tempo);
    beatQuarter(); // Don't await!!
}
loop();

async function beatQuarter() {
    let startNext = false;
    for (const index in sequencerItems) {
        const item = sequencerItems[index];
        if (item.status === Status.PLAYING) {
            const steps = item.sequence.steps[item.currentStep];
            for (const step of steps) {
                if (step?.note) {
                    const patch = getPatch(step.patchId);
                    if (patch.synth) {
                        // We dont want to await here, because we want to play all notes at the same time
                        // And we dont need an id, because it will note off automatically
                        synthNewWithId(patch.synth, -1, patch.groupId, {
                            ...patch.params,
                            freq: Note.freq(Note.fromMidi(step.note)) || 440,
                            velocity: step.velocity,
                            dur: 0.25,
                        });
                    }
                }
            }
            item.currentStep++;
            if (item.currentStep >= item.sequence.stepCount) {
                if (item.sequence.playing) {
                    item.currentStep = 0;
                } else {
                    sequencerItems.splice(Number(index), 1);
                }
                if (index === '0') {
                    startNext = true;
                }
            }
        }
    }
    if (startNext) {
        for (const item of sequencerItems) {
            item.status = Status.PLAYING;
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
        status: sequencerItems.length ? Status.STARTING_NEXT : Status.PLAYING,
    });
}

export function stopNext(sequence: Sequence) {}
