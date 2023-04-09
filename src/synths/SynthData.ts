import { Encoders } from '../layout/encoders.layout';
import { currentPatchId } from '../patch';
import { minmax } from '../util';
import { patchEncoder, synthEncoder } from '../views/patches/encoders';

// TODO when pressing patch view button several time switch between views
// TODO long press patch view button to allow to select a different patch
// TODO should we find a way to switch patch part of selected sequence?
//   Right now we are browsing through all patch. But could be interest to
//   be able to browse only through patch of the selected sequence...

export class SynthData {
    // FIXME
    // synthDef?: SynthDef;
    synthDef?: any;

    currentView = 0;
    lastPatchId = currentPatchId;

    setView(index: number) {
        this.currentView = minmax(index, 0, this.views.length - 1);
    }

    changeView(direction: number) {
        this.setView(this.currentView + direction);
    }

    resetView() {
        this.currentView = 0;
    }

    get data() {
        // reset view if patch changed
        if (this.lastPatchId !== currentPatchId) {
            this.resetView();
            this.lastPatchId = currentPatchId;
        }
        return this.views[this.currentView];
    }

    constructor(
        public name: string,
        public synthDefCode: string,
        public views: {
            encoders: Encoders;
            header?: () => void;
        }[],
        public defaultValue: { [key: string]: number | string },
    ) {
        // Force first view to have patch and synth encoder
        const { encoders: [_skip1, _skip2, ...encoders], ...rest } = this.views[0];
        this.views[0] = {
            encoders: [patchEncoder, synthEncoder, ...encoders],
            ...rest,
        };
    }
}
