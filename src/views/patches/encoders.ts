import { Color } from 'zic_node_ui';
import { EncoderData } from '../../layout/encoders.layout';
import { shiftPressed } from '../../midi';
import { currentPatchId, getPatch, setCurrentPatchId } from '../../patch';
import { minmax } from '../../util';

export const patchEncoder: EncoderData = {
    node: {
        title: 'Patch',
        getValue: () => `#${`${currentPatchId}`.padStart(3, '0')}`,
        unit: () => getPatch(currentPatchId).name,
    },
    handler: async (direction) => {
        setCurrentPatchId(
            currentPatchId + direction * (shiftPressed ? ([1,-1].includes(direction) ? 10 : 50) : 1),
        );
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
            value: Math.round(getPatch(currentPatchId).floats[fId] * 100).toString(),
            valueColor,
        }),
        unit: '%',
        isDisabled,
        bgColor,
    },
    handler: async (direction) => {
        const patch = getPatch(currentPatchId);
        patch.setNumber(fId, minmax(patch.floats[fId] + direction * (shiftPressed ? 0.05 : 0.01), 0, 1));
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
        getValue: () => (getPatch(currentPatchId).floats[fId] ? 'On' : 'Off'),
        isDisabled,
        bgColor,
    },
    handler: async (direction) => {
        const patch = getPatch(currentPatchId);
        patch.setNumber(fId, minmax(patch.floats[fId] + direction, 0, 1));
        return true;
    },
});

export const msEncoder = (fId: number, title: string, valueColor?: Color): EncoderData => ({
    node: {
        title,
        getValue: () => ({
            value: getPatch(currentPatchId).floats[fId].toString(),
            valueColor,
        }),
        unit: 'ms',
    },
    handler: async (direction) => {
        const patch = getPatch(currentPatchId);
        patch.setNumber(fId, minmax(patch.floats[fId] + direction * (shiftPressed ? 100 : 10), 0, 9900));
        return true;
    },
});
