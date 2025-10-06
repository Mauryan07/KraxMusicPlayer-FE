import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTracks } from "../api/musicApi";

// Thunk: fetch all tracks (DTO list)
export const fetchTracks = createAsyncThunk(
    "tracks/fetchTracks",
    async () => {
        const { data } = await getTracks();
        return data;
    }
);

const trackSlice = createSlice({
    name: "tracks",
    initialState: {
        items: [],
        status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {
        // Add synchronous reducers if needed later
        clearTracks(state) {
            state.items = [];
            state.status = "idle";
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTracks.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchTracks.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload || [];
            })
            .addCase(fetchTracks.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error?.message || "Failed to load tracks";
            });
    }
});

export const { clearTracks } = trackSlice.actions;
export default trackSlice.reducer;