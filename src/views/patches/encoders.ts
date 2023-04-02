import { Color } from 'zic_node_ui';
import { EncoderData } from '../../layout/encoders.layout';
import { shiftPressed } from '../../midi';
import { currentPatchId, getPatch, setCurrentPatchId } from '../../patch';
import { minmax } from '../../util';
import { synthsNames } from './synths';

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
}

export const percentageEncoder = (
    fId: number,
    title: string,
    { valueColor, isDisabled, bgColor }: EncoderOptions = {},
): EncoderData => ({
    node: {
        title,
        getValue: () => ({
            value: 'fixme', //Math.round(getPatch(currentPatchId).floats[fId] * 100).toString(),
            valueColor,
        }),
        unit: '%',
        isDisabled,
        bgColor,
    },
    handler: async (direction) => {
        const patch = getPatch(currentPatchId);
        // patch.setNumber(fId, minmax(patch.floats[fId] + direction * (shiftPressed ? 0.05 : 0.01), 0, 1));
        return true;
    },
});

export const onOffEncoder = (
    fId: number,
    title: string,
    { isDisabled, bgColor }: EncoderOptions = {},
): EncoderData => ({
    node: {
        title,
        getValue: () => 'fixme', //(getPatch(currentPatchId).floats[fId] ? 'On' : 'Off'),
        isDisabled,
        bgColor,
    },
    handler: async (direction) => {
        const patch = getPatch(currentPatchId);
        // patch.setNumber(fId, minmax(patch.floats[fId] + direction, 0, 1));
        return true;
    },
});

export const msEncoder = (fId: number, title: string, valueColor?: Color): EncoderData => ({
    node: {
        title,
        getValue: () => ({
            value: 'fixme', //getPatch(currentPatchId).floats[fId].toString(),
            valueColor,
        }),
        unit: 'ms',
    },
    handler: async (direction) => {
        const patch = getPatch(currentPatchId);
        // patch.setNumber(fId, minmax(patch.floats[fId] + direction * (shiftPressed ? 100 : 10), 0, 9900));
        return true;
    },
});
