import { createSlice } from "@reduxjs/toolkit";

/**
 * Player slice manages:
 * - Current track DTO
 * - Queue (array of TrackDTO)
 * - currentIndex within queue
 * - isPlaying
 * - shuffle mode
 */
const initialState = {
    track: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    shuffle: false
};

const playerSlice = createSlice({
    name: "player",
    initialState,
    reducers: {
        setQueue(state, action) {
            const { tracks, startFileHash } = action.payload;
            state.queue = tracks || [];
            const idx = tracks.findIndex(t => t.fileHash === startFileHash);
            state.currentIndex = idx >= 0 ? idx : 0;
            state.track = state.queue[state.currentIndex] || null;
            state.isPlaying = Boolean(state.track);
        },
        playTrack(state, action) {
            const track = action.payload;
            if (track) {
                // If track not in queue, append and set index
                const existingIndex = state.queue.findIndex(t => t.fileHash === track.fileHash);
                if (existingIndex === -1) {
                    state.queue.push(track);
                    state.currentIndex = state.queue.length - 1;
                } else {
                    state.currentIndex = existingIndex;
                }
                state.track = track;
                state.isPlaying = true;
            }
        },
        playByIndex(state, action) {
            const idx = action.payload;
            if (idx >= 0 && idx < state.queue.length) {
                state.currentIndex = idx;
                state.track = state.queue[idx];
                state.isPlaying = true;
            }
        },
        playNext(state) {
            if (!state.queue.length) return;
            if (state.shuffle) {
                if (state.queue.length === 1) {
                    // Only one item, replay it
                    state.isPlaying = true;
                    return;
                }
                let nextIndex = state.currentIndex;
                // ensure different track
                for (let safety = 0; safety < 10 && nextIndex === state.currentIndex; safety++) {
                    nextIndex = Math.floor(Math.random() * state.queue.length);
                }
                state.currentIndex = nextIndex;
                state.track = state.queue[nextIndex];
                state.isPlaying = true;
            } else {
                const nextIndex = state.currentIndex + 1;
                if (nextIndex < state.queue.length) {
                    state.currentIndex = nextIndex;
                    state.track = state.queue[nextIndex];
                    state.isPlaying = true;
                } else {
                    // Reached end: stop (can change to loop if you prefer)
                    state.isPlaying = false;
                }
            }
        },
        playPrev(state) {
            if (!state.queue.length) return;
            if (state.shuffle) {
                // Random previous when shuffle (acts like next random selection)
                if (state.queue.length === 1) return;
                let prevIndex = state.currentIndex;
                for (let safety = 0; safety < 10 && prevIndex === state.currentIndex; safety++) {
                    prevIndex = Math.floor(Math.random() * state.queue.length);
                }
                state.currentIndex = prevIndex;
                state.track = state.queue[prevIndex];
                state.isPlaying = true;
            } else {
                const prevIndex = state.currentIndex - 1;
                if (prevIndex >= 0) {
                    state.currentIndex = prevIndex;
                    state.track = state.queue[prevIndex];
                    state.isPlaying = true;
                } else {
                    // At start: do nothing (could wrap if desired)
                }
            }
        },
        pauseTrack(state) {
            state.isPlaying = false;
        },
        toggleShuffle(state) {
            state.shuffle = !state.shuffle;
        },
        clearPlayer(state) {
            Object.assign(state, initialState);
        }
    }
});

export const {
    setQueue,
    playTrack,
    playByIndex,
    playNext,
    playPrev,
    pauseTrack,
    toggleShuffle,
    clearPlayer
} = playerSlice.actions;

export default playerSlice.reducer;