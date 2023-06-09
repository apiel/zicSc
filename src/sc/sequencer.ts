import { Note } from 'tonal';
import { getPatch } from '../patch';
import { Sequence } from '../sequence';
import { synthNewWithId } from './cmd';
import EventEmitter from 'events';

export const eventSequencer = new EventEmitter();

let bpm = 120;
// There is 4 quarter per beat, and 60 beat per minutes (bpm), but tempo is in ms
const getTempo = () => (60 / (bpm * 4));
let quaterBeatInSec = getTempo();

export enum Status {
    PLAYING,
    STARTING_NEXT,
}

interface SequencerItem {
    sequence: Sequence;
    repeat: number;
    status: Status;
    currentStep: number;
}

const sequencerItems: SequencerItem[] = [];

export function loop() {
    setTimeout(loop, quaterBeatInSec * 1000);
    return beatQuarter();
}

function sequenceEnd(item: SequencerItem, index: number) {
    item.sequence.activeStep = undefined;
    item.sequence.playing = false;
    sequencerItems.splice(index, 1);
    eventSequencer.emit('sequenceEnd', item);
}

function sequenceOnSameTrack(item: SequencerItem) {
    return sequencerItems.findIndex((item2) => item2 !== item && item2.sequence.trackId === item.sequence.trackId);
}

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
                            gateDuration: quaterBeatInSec,
                        });
                    }
                }
            }
            item.currentStep++;
            item.sequence.activeStep = item.currentStep;
            if (item.currentStep >= item.sequence.stepCount) {
                item.currentStep = 0;
                if (item.sequence.playing && (!item.sequence.repeat || item.repeat < item.sequence.repeat)) {
                    item.sequence.activeStep = 0;
                    item.repeat++;
                    const nextIndex = sequenceOnSameTrack(item);
                    if (nextIndex !== -1) {
                        sequencerItems[nextIndex].status = Status.PLAYING;
                        sequenceEnd(item, Number(index));
                    }
                } else {
                    sequenceEnd(item, Number(index));
                }
                if (index === '0') {
                    startNext = true;
                }
            }
        }
    }
    if (startNext) {
        for (const item of sequencerItems) {
            // item.status = Status.PLAYING;
            if (item.status === Status.STARTING_NEXT && sequenceOnSameTrack(item) === -1) {
                item.status = Status.PLAYING;
            }
        }
    }
    eventSequencer.emit('beatQuarter', sequencerItems);
}

export function setBpm(newBpm: number) {
    bpm = newBpm;
    quaterBeatInSec = getTempo();
}

export function addToSequencer(
    sequence: Sequence,
    status = sequencerItems.length ? Status.STARTING_NEXT : Status.PLAYING,
) {
    sequencerItems.push({
        sequence,
        status,
        repeat: 0,
        currentStep: 0,
    });
}
