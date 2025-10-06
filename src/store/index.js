import { configureStore } from "@reduxjs/toolkit";
import trackReducer from "../features/tracks/trackSlice";
import albumReducer from "../features/albums/albumSlice";
import searchReducer from "../features/search/searchSlice";
import uploadReducer from "../features/upload/uploadSlice";
import playerReducer from "../features/player/playerSlice";

export default configureStore({
    reducer: {
        tracks: trackReducer,
        albums: albumReducer,
        search: searchReducer,
        upload: uploadReducer,
        player: playerReducer
    }
});