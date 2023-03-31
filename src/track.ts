import { Color } from 'zic_node_ui';
import { color } from './style';

export interface Track {
    id: number;
    name: string;
    color: Color;
    padColor: number;
}

let tracks: Track[] = [];

export const getTracks = () => tracks;
export const getTrack = (id: number) => tracks[id];
export const getTrackCount = () => tracks.length;

// export const getTrackStyle = (id: number) => color.tracks[id % color.tracks.length];

export async function loadTracks() {
    try {
        for(let i = 0; i < color.tracks.length; i++) {
            const track: Track = {
                id: i,
                name: `Track ${i + 1}`,
                ...color.tracks[i],
            };
            tracks.push(track);
        }
    } catch (error) {
        console.error(`Error while loading tracks`, error);
    }
}
