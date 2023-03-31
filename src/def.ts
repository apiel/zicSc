export enum View {
    Sequencer = 'Sequencer',
    SequencerEdit = 'SequencerEdit',
    Patch = 'Patch',
}

export const beatViews = [View.Sequencer, View.SequencerEdit] as const;
