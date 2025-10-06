import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTracks } from "../../api/musicApi";

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
        status: "idle",
        error: null
    },
    reducers: {},
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
                state.error =
                    action.error?.message || "Failed to load tracks";
            });
    }
});

export default trackSlice.reducer;