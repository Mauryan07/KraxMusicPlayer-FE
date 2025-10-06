import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadTracks } from '../../api/musicApi';

export const uploadMusic = createAsyncThunk('upload/uploadMusic', async (files) => {
    const { data } = await uploadTracks(files);
    return data;
});

const uploadSlice = createSlice({
    name: 'upload',
    initialState: { status: 'idle', error: null },
    extraReducers: (builder) => {
        builder
            .addCase(uploadMusic.pending, (state) => { state.status = 'loading'; })
            .addCase(uploadMusic.fulfilled, (state) => { state.status = 'succeeded'; })
            .addCase(uploadMusic.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export default uploadSlice.reducer;