import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    track: null,
    isPlaying: false,
    trackCollection: [],
    currentIndex: -1,
    shuffle: false,
    history: [],
    shufflePool: []
};

const playerSlice = createSlice({
    name: "player",
    initialState,
    reducers: {
        setTrackCollection(state, action) {
            const tracks = action.payload || [];
            state.trackCollection = tracks;

            if (state.shuffle) {
                const currentHash = state.track?.fileHash;
                state.shufflePool = tracks
                    .filter(t => t.fileHash !== currentHash)
                    .map(t => t.fileHash);
                if (
                    currentHash &&
                    !tracks.some(t => t.fileHash === currentHash)
                ) {
                    state.history = [];
                    state.track = null;
                    state.currentIndex = -1;
                    state.isPlaying = false;
                }
            } else if (state.track) {
                const idx = tracks.findIndex(
                    t => t.fileHash === state.track.fileHash
                );
                state.currentIndex = idx;
            } else {
                state.currentIndex = -1;
            }
        },
        playTrack(state, action) {
            const track = action.payload;
            state.track = track;
            state.isPlaying = true;
            const idx = state.trackCollection.findIndex(
                t => t.fileHash === track.fileHash
            );
            state.currentIndex = idx;

            if (state.shuffle) {
                if (
                    !state.history.length ||
                    state.history[state.history.length - 1] !== track.fileHash
                ) {
                    state.history.push(track.fileHash);
                }
                state.shufflePool = state.shufflePool.filter(
                    fh => fh !== track.fileHash
                );
                if (state.shufflePool.length === 0 && state.trackCollection.length > 1) {
                    state.shufflePool = state.trackCollection
                        .filter(t => t.fileHash !== track.fileHash)
                        .map(t => t.fileHash);
                    state.history = [track.fileHash];
                }
            } else {
                if (
                    !state.history.length ||
                    state.history[state.history.length - 1] !== track.fileHash
                ) {
                    state.history.push(track.fileHash);
                }
            }
        },
        pauseTrack(state) {
            state.isPlaying = false;
        },
        resumeTrack(state) {
            if (state.track) state.isPlaying = true;
        },
        toggleShuffle(state) {
            state.shuffle = !state.shuffle;
            if (state.shuffle) {
                const currentHash = state.track?.fileHash;
                state.shufflePool = state.trackCollection
                    .filter(t => t.fileHash !== currentHash)
                    .map(t => t.fileHash);
                state.history = currentHash ? [currentHash] : [];
            } else {
                if (state.track) {
                    state.currentIndex = state.trackCollection.findIndex(
                        t => t.fileHash === state.track.fileHash
                    );
                } else {
                    state.currentIndex = -1;
                }
                state.shufflePool = [];
            }
        },
        nextTrack(state) {
            if (!state.trackCollection.length) return;
            if (state.shuffle) {
                if (state.shufflePool.length === 0) {
                    const currentHash = state.track?.fileHash;
                    state.shufflePool = state.trackCollection
                        .filter(t => t.fileHash !== currentHash)
                        .map(t => t.fileHash);
                    state.history = currentHash ? [currentHash] : [];
                }
                const randIdx = Math.floor(Math.random() * state.shufflePool.length);
                const nextHash = state.shufflePool[randIdx];
                state.shufflePool.splice(randIdx, 1);
                const nextTrack = state.trackCollection.find(
                    t => t.fileHash === nextHash
                );
                if (nextTrack) {
                    state.track = nextTrack;
                    state.isPlaying = true;
                    state.history.push(nextHash);
                    state.currentIndex = state.trackCollection.findIndex(
                        t => t.fileHash === nextHash
                    );
                }
            } else {
                if (state.currentIndex < 0) state.currentIndex = 0;
                else
                    state.currentIndex =
                        (state.currentIndex + 1) % state.trackCollection.length;
                const nextTrack = state.trackCollection[state.currentIndex];
                if (nextTrack) {
                    state.track = nextTrack;
                    state.isPlaying = true;
                    state.history.push(nextTrack.fileHash);
                }
            }
        },
        prevTrack(state) {
            if (!state.trackCollection.length || !state.track) return;
            if (state.shuffle) {
                if (state.history.length > 1) {
                    state.history.pop();
                    const prevHash =
                        state.history[state.history.length - 1];
                    const prevTrack = state.trackCollection.find(
                        t => t.fileHash === prevHash
                    );
                    if (prevTrack) {
                        state.track = prevTrack;
                        state.isPlaying = true;
                        state.currentIndex = state.trackCollection.findIndex(
                            t => t.fileHash === prevHash
                        );
                        const visited = new Set(state.history);
                        state.shufflePool = state.trackCollection
                            .filter(t => !visited.has(t.fileHash))
                            .map(t => t.fileHash);
                    }
                }
            } else {
                if (state.currentIndex <= 0)
                    state.currentIndex = state.trackCollection.length - 1;
                else state.currentIndex -= 1;
                const prevTrack = state.trackCollection[state.currentIndex];
                if (prevTrack) {
                    state.track = prevTrack;
                    state.isPlaying = true;
                    state.history.push(prevTrack.fileHash);
                }
            }
        }
    }
});

export const {
    setTrackCollection,
    playTrack,
    pauseTrack,
    resumeTrack,
    toggleShuffle,
    nextTrack,
    prevTrack
} = playerSlice.actions;

export default playerSlice.reducer;