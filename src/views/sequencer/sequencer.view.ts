import { clear, drawFilledRect, Rect, setColor } from 'zic_node_ui';
import { config } from '../../config';
import { renderMessage } from '../../draw/drawMessage';
import { MidiMsg } from '../../midi';
import { sequenceNode } from '../../nodes/sequence.node';
import { sequences } from '../../sequence';
import { color, unit } from '../../style';
import { getTrack } from '../../track';
import { RenderOptions } from '../../view';
import { bankController, sequencePlayStopMidiHandler, sequencerController } from '../controller/sequencerController';

const { margin } = unit;
const height = config.screen.size.h / config.sequence.row;

const sequenceWidth = config.screen.size.w / config.sequence.col - margin;

const sequenceRect = (id: number): Rect => {
    const size = { w: sequenceWidth, h: height - margin };
    return {
        position: {
            x: margin + (margin + size.w) * (id % config.sequence.col),
            y: margin + (margin + size.h) * Math.floor(id / config.sequence.col),
        },
        size,
    };
};

export async function sequencerView({ controllerRendering }: RenderOptions = {}) {
    if (controllerRendering) {
        sequencerController();
        bankController();
    }
    clear(color.background);

    for (let i = 0; i < 30; i++) {
        const rect = sequenceRect(i);
        const { id, trackId, nextSequenceId, ...seq } = sequences[i];
        if (trackId !== undefined) {
            let next;
            if (nextSequenceId !== undefined) {
                next = nextSequenceId.toString();
            }
            sequenceNode(id, rect, {
                ...seq,
                trackColor: getTrack(trackId).color,
                next,
            });
        } else {
            setColor(color.foreground);
            drawFilledRect(rect);
        }
    }

    renderMessage();
}

export function sequencerMidiHandler(midiMsg: MidiMsg) {
    return sequencePlayStopMidiHandler(midiMsg);
}
