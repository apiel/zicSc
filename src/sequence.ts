import { readFile, writeFile } from 'fs/promises';
import { MAX_STEPS_IN_PATTERN, SEQUENCE_COUNT, config } from './config';
import { setCurrentPatchId } from './patch';
import { Status, addToSequencer } from './sc/sequencer';
import { fileExist } from './util';

export interface Step {
    note: number;
    velocity: number;
    tie: boolean;
    patchId: number;
    condition?: number;
}

export const STEP_CONDITIONS = [
    '---',
    'Pair',
    '4th',
    '6th',
    '8th',
    'Impair',
    '1%',
    '2%',
    '5%',
    '10%',
    '20%',
    '30%',
    '40%',
    '50%',
    '60%',
    '70%',
    '80%',
    '90%',
    '95%',
];

export enum StepCondition {
    All,
    Pair,
    Fourth,
    Sixth,
    Eighth,
    Impair,
    OnePercent,
    TwoPercent,
    FivePercent,
    TenPercent,
    TwentyPercent,
    ThirtyPercent,
    FortyPercent,
    FiftyPercent,
    SixtyPercent,
    SeventyPercent,
    EightyPercent,
    NinetyPercent,
    NinetyFivePercent,
}

export type Steps = (Step | null)[][];

// TODO refacto to use class
export interface Sequence {
    id: number;
    trackId?: number;
    playing: boolean;
    detune: number;
    repeat: number;
    nextSequenceId?: number;
    activeStep?: number;
    stepCount: number;
    steps: Steps;
}

// FIXME should this be an object instead of an array?
// or should id be the index?
export let sequences: Sequence[] = [];

export function getSequence(id: number) {
    return sequences[id];
}

export function getPlayingSequence(trackId: number) {
    return sequences.find((s) => s.playing && s.trackId === trackId);
}

export function getPlayingSequencesForPatch(patchId: number) {
    return getSequencesForPatchId(patchId).filter((s) => s.playing);
}

export function getSequencesForPatchId(patchId: number) {
    return sequences.filter((s) => s.steps.flat().find((step) => step?.patchId === patchId));
}

export function toggleSequence(sequence: Sequence) {
    sequence.playing = !sequence.playing;
    if (sequence.playing) {
        return addToSequencer(sequence);
    }
}

function getFilepath(id: number) {
    const idStr = id.toString().padStart(3, '0');
    return `${config.path.sequences}/${idStr}.json`;
}

export async function loadSequence(id: number) {
    if (await fileExist(getFilepath(id))) {
        const content = await readFile(getFilepath(id), 'utf8');
        const sequence: Sequence = JSON.parse(content.toString());
        // Fill missing step to pattern
        sequence.steps = [
            ...sequence.steps,
            ...Array.from({ length: MAX_STEPS_IN_PATTERN - sequence.steps.length }, () => []),
        ];
        if (sequence.playing) {
            addToSequencer(sequence, Status.PLAYING);
        }
        sequences[sequence.id] = sequence;
    } else {
        const sequence: Sequence = {
            id,
            trackId: undefined,
            playing: false,
            detune: 0,
            repeat: 0,
            stepCount: 16,
            steps: Array.from({ length: MAX_STEPS_IN_PATTERN }, () => []),
        };
        sequences[sequence.id] = sequence;
    }
}

export async function loadSequences() {
    try {
        sequences = [];
        for (let id = 0; id < SEQUENCE_COUNT; id++) {
            await loadSequence(id);
        }
    } catch (error) {
        console.error(`Error while loading sequences`, error);
    }
}

export function saveSequence(sequence: Sequence) {
    return writeFile(getFilepath(sequence.id), JSON.stringify(sequence));
}

export async function saveSequences() {
    try {
        for (let id = 0; id < SEQUENCE_COUNT; id++) {
            await saveSequence(sequences[id]);
        }
    } catch (error) {
        console.error(`Error while saving sequences`, error);
    }
}

export function newSequence() {
    const sequence = {
        id: sequences.length,
        trackId: 0,
        playing: false,
        detune: 0,
        repeat: 0,
        nextSequenceId: undefined,
        patchId: 0,
        stepCount: 16,
        steps: Array.from({ length: MAX_STEPS_IN_PATTERN }, () => []),
    };
    sequences.push(sequence);
    setSelectedSequenceId(sequence.id);
}

let selectedSequenceId = 0;
export function getSelectedSequenceId() {
    return selectedSequenceId;
}

export function getSelectedSequence() {
    return sequences[selectedSequenceId];
}

export function setSelectedSequenceId(id: number) {
    selectedSequenceId = id % sequences.length;
    const patchId = sequences[selectedSequenceId].steps.flat().find((step) => step)?.patchId;
    if (patchId !== undefined) {
        setCurrentPatchId(patchId);
    }
}

export function incSelectedSequenceId(direction: number) {
    if (direction > 0 && selectedSequenceId < sequences.length - 1) {
        setSelectedSequenceId(selectedSequenceId + 1);
    } else if (direction < 0 && selectedSequenceId > 0) {
        setSelectedSequenceId(selectedSequenceId - 1);
    }
}
