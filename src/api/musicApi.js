import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const getTracks = () => axios.get(`${API_BASE}/tracks`);
export const getAlbums = () => axios.get(`${API_BASE}/albums`);
export const searchTracks = (name) => axios.get(`${API_BASE}/search/title`, { params: { name } });
export const searchAlbums = (name) => axios.get(`${API_BASE}/search/album`, { params: { name } });
export const uploadTracks = (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return axios.post(`${API_BASE}/upload`, formData);
};
export const getTrackAudioUrl = (fileHash) => `${API_BASE}/track/${fileHash}/audio`;
export const getTrackArtworkUrl = (fileHash) => `${API_BASE}/track/${fileHash}/artwork`;
export const uploadTrackFile = async ({ file, title, album }, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (album) formData.append("album", album);

    // Adjust endpoint if your backend differs
    const res = await axios.post(`${API_BASE}/api/tracks/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (evt) => {
            if (onProgress && evt.total) {
                const pct = (evt.loaded / evt.total) * 100;
                onProgress(pct);
            }
        }
    });
    return res.data;
};