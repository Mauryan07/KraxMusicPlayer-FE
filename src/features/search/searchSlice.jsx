import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { searchTracks, searchAlbums } from "../../api/musicApi";

// Thunks
export const fetchTrackResults = createAsyncThunk("search/fetchTracks", async (query) => {
    const { data } = await searchTracks(query);
    return data;
});
export const fetchAlbumResults = createAsyncThunk("search/fetchAlbums", async (query) => {
    const { data } = await searchAlbums(query);
    return data;
});

const searchSlice = createSlice({
    name: "search",
    initialState: {
        query: "",
        trackResults: [],
        albumResults: [],
        loadingTracks: false,
        loadingAlbums: false,
        errorTracks: null,
        errorAlbums: null
    },
    reducers: {
        setQuery(state, action) {
            state.query = action.payload;
        },
        clearSearch(state) {
            state.query = "";
            state.trackResults = [];
            state.albumResults = [];
            state.errorTracks = null;
            state.errorAlbums = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Tracks
            .addCase(fetchTrackResults.pending, (state) => {
                state.loadingTracks = true;
                state.errorTracks = null;
            })
            .addCase(fetchTrackResults.fulfilled, (state, action) => {
                state.loadingTracks = false;
                state.trackResults = action.payload;
            })
            .addCase(fetchTrackResults.rejected, (state, action) => {
                state.loadingTracks = false;
                state.errorTracks = action.error.message;
            })
            // Albums
            .addCase(fetchAlbumResults.pending, (state) => {
                state.loadingAlbums = true;
                state.errorAlbums = null;
            })
            .addCase(fetchAlbumResults.fulfilled, (state, action) => {
                state.loadingAlbums = false;
                state.albumResults = action.payload;
            })
            .addCase(fetchAlbumResults.rejected, (state, action) => {
                state.loadingAlbums = false;
                state.errorAlbums = action.error.message;
            });
    }
});

export const { setQuery, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;