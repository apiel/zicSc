import { Note } from 'tonal';
import { getPatch } from '../patch';
import { Sequence } from '../sequence';
import { synthNewWithId } from './cmd';
import EventEmitter from 'events';

export const eventSequencer = new EventEmitter();

let bpm = 120;
// There is 4 quarter per beat, and 60 beat per minutes (bpm), but tempo is in ms
const getTempo = () => (60 / (bpm * 4)) * 1000;
let tempo = getTempo();

export enum Status {
    PLAYING,
    STARTING_NEXT,
}

interface SequencerItem {
    sequence: Sequence;
    repeat: number;
    status: Status;
}

const sequencerItems: SequencerItem[] = [];

export function loop() {
    setTimeout(loop, tempo);
    return beatQuarter();
}

async function beatQuarter() {
    let startNext = false;
    for (const index in sequencerItems) {
        const item = sequencerItems[index];
        if (item.status === Status.PLAYING) {
            const steps = item.sequence.steps[item.sequence.activeStep];
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
                            dur: 0.25, // FIXME
                        });
                    }
                }
            }
            item.sequence.activeStep++;
            if (item.sequence.activeStep >= item.sequence.stepCount) {
                item.sequence.activeStep = 0;
                if (item.sequence.playing && (!item.sequence.repeat || item.repeat < item.sequence.repeat)) {
                    item.repeat++;
                } else {
                    item.sequence.playing = false;
                    sequencerItems.splice(Number(index), 1);
                    eventSequencer.emit('sequenceEnd', item);
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
    eventSequencer.emit('beatQuarter', sequencerItems);
}

export function setBpm(newBpm: number) {
    bpm = newBpm;
    tempo = getTempo();
}

export function addToSequencer(
    sequence: Sequence,
    status = sequencerItems.length ? Status.STARTING_NEXT : Status.PLAYING,
) {
    sequence.activeStep = 0; // ??
    sequencerItems.push({
        sequence,
        status,
        repeat: 0,
    });
}
