import axios from 'axios';

/**
 * API Base:
 * Prefer setting VITE_API_BASE in your environment, e.g.
 *   VITE_API_BASE=http://localhost:8080/api
 * Fallback (dev default) is http://localhost:8080/api
 */
// For Vite
export const API_BASE = import.meta.env?.VITE_API_BASE || 'http://192.168.1.46:8080/api';
/* --------------------------- Basic Data Fetchers --------------------------- */
export const getTracks = () => axios.get(`${API_BASE}/tracks`);
export const getAlbums = () => axios.get(`${API_BASE}/albums`);
export const searchTracks = (name) =>
    axios.get(`${API_BASE}/search/title`, { params: { name } });
export const searchAlbums = (name) =>
    axios.get(`${API_BASE}/search/album`, { params: { name } });

/* --------------------------- Resource URL Helpers -------------------------- */
export const getTrackAudioUrl = (fileHash) =>
    `${API_BASE}/track/${encodeURIComponent(fileHash)}/audio`;
export const getTrackArtworkUrl = (fileHash) =>
    `${API_BASE}/track/${encodeURIComponent(fileHash)}/artwork`;

/* --------------------------- Multi-File Upload -----------------------------
 * Backend controller signature:
 *   @PostMapping("/api/upload")
 *   public ResponseEntity<String> uploadFile(@RequestParam("files") List<MultipartFile> files)
 *
 * Therefore:
 *  - Endpoint: POST  {API_BASE}/upload
 *  - Field name: 'files' (REPEATED for each file)
 */
export const uploadTracks = (files, onProgress) => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
            if (onProgress && evt.total) {
                onProgress(Math.round((evt.loaded / evt.total) * 100));
            }
        }
    }).catch(err => {
        // Surface backend message if present
        const msg = err?.response?.data || err.message || 'Upload failed';
        throw new Error(msg);
    });
};

/* --------------------------- Single File Convenience -----------------------
 * Uses same endpoint & 'files' field (still acceptable for the backend list param).
 */
export const uploadSingleTrack = (file, onProgress) =>
    uploadTracks([file], onProgress);

/* --------------------- (Optional) Metadata Upload Placeholder --------------
 * If you later extend the backend to accept metadata, adapt or create a new
 * endpoint. For now we keep a guarded function to avoid misuse.
 *
 * Example (commented out):
 *
 * export const uploadTrackWithMeta = async ({ file, title, album }, onProgress) => {
 *   const formData = new FormData();
 *   formData.append('files', file); // still 'files'
 *   if (title) formData.append('title', title);
 *   if (album) formData.append('album', album);
 *   return axios.post(`${API_BASE}/upload/meta`, formData, { ... });
 * };
 */

/* --------------------------- Axios Instance (Optional) ---------------------
 * If you need interceptors (auth, logging), create one place here:
 *
 * export const api = axios.create({ baseURL: API_BASE });
 * api.interceptors.response.use(r => r, e => { ... });
 */