import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAlbums } from "../../api/musicApi";

export const fetchAlbums = createAsyncThunk("albums/fetchAlbums", async () => {
    const { data } = await getAlbums();
    return data; // Expecting pure AlbumDTO[]
});

const albumSlice = createSlice({
    name: "albums",
    initialState: { items: [], status: "idle", error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAlbums.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAlbums.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchAlbums.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    }
});

export default albumSlice.reducer;