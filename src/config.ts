const BASE_PATH = '.';
export const DATA_PATH = `${BASE_PATH}/data`;

const screen = {
    size: { w: 480, h: 280 },
    col: 2 as 1 | 2,
    // size: { w: 240, h: 240 },
    // col: 1 as 1 | 2,
};

const path = {
    patches: `${DATA_PATH}/patches`,
    sequences: `${DATA_PATH}/projects/000/sequences`,
    wavetables: `${DATA_PATH}/wavetables`,
};

export const config = {
    screen,
    path,
    encoder: {
        perRow: 4,  
    },
    sequence: {
        col: 6,
        row: 5,
    },
};

export const MAX_STEPS_IN_PATTERN = 64;
export const SEQUENCE_COUNT = 5 * 6 * 5 * 5; // 5*6 pads and 5*5 banks
export const PATCH_COUNT = SEQUENCE_COUNT;
export const NOTE_END = 119;
export const NOTE_START = 12;
