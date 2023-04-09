import { Color } from 'zic_node_ui';
import { EncoderData } from '../../layout/encoders.layout';
import { shiftPressed } from '../../midi';
import { EncoderStringFn } from '../../nodes/encoder.node';
import { currentPatchId, getPatch, setCurrentPatchId } from '../../patch';
import { minmax } from '../../util';
import { synthsNames } from '../../synths';

export const patchEncoder: EncoderData = {
    node: {
        title: 'Patch',
        getValue: () => `#${`${currentPatchId}`.padStart(3, '0')}`,
        info: () => getPatch(currentPatchId).name,
    },
    handler: async (direction) => {
        setCurrentPatchId(currentPatchId + direction * (shiftPressed ? ([1, -1].includes(direction) ? 10 : 50) : 1));
        return true;
    },
};

export const synthEncoder: EncoderData = {
    node: {
        title: 'Synth',
        getValue: () => getPatch(currentPatchId).synth || 'None',
    },
    handler: async (direction) => {
        const patch = getPatch(currentPatchId);
        const synth = patch.synth;
        if (!synth) {
            if (direction === -1) {
                return false;
            }
            patch.synth = synthsNames[0];
            return true;
        }
        const synthIndex = synthsNames.indexOf(synth);
        if (synthIndex === 0 && direction === -1) {
            patch.synth = undefined;
            return true;
        }
        patch.synth = synthsNames[minmax(synthIndex + direction, 0, synthsNames.length - 1)];
        return true;
    },
};

type IsDisabled = () => boolean;

interface EncoderOptions {
    valueColor?: Color;
    isDisabled?: IsDisabled;
    bgColor?: Color;
    info?: EncoderStringFn;
    unit?: EncoderStringFn;
}

interface NumberEncoderOptions extends EncoderOptions {
    ratio?: number;
    shiftRatio?: number;
    formatValue?: (value: number) => string;
}

export const patchNumberEncoder = (
    key: string,
    title: string,
    defaultValue: { [key: string]: number | string },
    min: number | string,
    max: number | string,
    { valueColor, ratio, shiftRatio, formatValue, ...options }: NumberEncoderOptions = {},
): EncoderData => {
    if (!formatValue) {
        formatValue = (value) => value.toFixed(1);
    }
    return {
        node: {
            title,
            getValue: () => ({
                value: formatValue!(getPatch(currentPatchId).getData<number>(key, defaultValue[key] as number)),
                valueColor,
            }),
            ...options,
        },
        handler: async (direction) => {
            const patch = getPatch(currentPatchId);
            const minValue =
                typeof min === 'number'
                    ? min
                    : patch.getData<number>(min as string, defaultValue[min as string] as number);
            const maxValue =
                typeof max === 'number'
                    ? max
                    : patch.getData<number>(max as string, defaultValue[max as string] as number);
            patch.setNumber(key, defaultValue[key] as number, direction, minValue, maxValue, ratio, shiftRatio);
            return true;
        },
    };
};

export const patchPercentageEncoder = (
    key: string,
    title: string,
    defaultValue: { [key: string]: number | string },
    options: NumberEncoderOptions = {},
): EncoderData =>
    patchNumberEncoder(key, title, defaultValue, 0, 1, {
        ratio: 0.01,
        shiftRatio: 0.05,
        unit: '%',
        formatValue: (value) => (value * 100).toFixed(0),
        ...options,
    });

export const patchMsEncoder = (
    key: string,
    title: string,
    defaultValue: { [key: string]: number | string },
    min: number | string,
    max: number | string,
    options: NumberEncoderOptions = {},
): EncoderData =>
    patchNumberEncoder(key, title, defaultValue, min, max, {
        ratio: 0.01,
        shiftRatio: 0.05,
        unit: 'ms',
        formatValue: (value) => (value * 1000).toFixed(0),
        ...options,
    });

export const patchHzEncoder = (
    key: string,
    title: string,
    defaultValue: { [key: string]: number | string },
    options: NumberEncoderOptions = {},
): EncoderData =>
    patchNumberEncoder(key, title, defaultValue, 10, 10000, {
        ratio: 10,
        shiftRatio: 100,
        unit: 'Hz',
        ...options,
    });

export const patchLFOHzEncoder = (
    key: string,
    title: string,
    defaultValue: { [key: string]: number | string },
    options: NumberEncoderOptions = {},
): EncoderData =>
    patchNumberEncoder(key, title, defaultValue, 0.1, 10, {
        ratio: 0.1,
        shiftRatio: 1,
        unit: 'Hz',
        ...options,
    });
