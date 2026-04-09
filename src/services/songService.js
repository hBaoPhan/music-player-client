import axiosClient from './axiosClient';

const songService = {
    getAllSongs: () => {
        return axiosClient.get('/songs');
    },
    getSongById: (id) => {
        return axiosClient.get(`/songs/${id}`);
    },
    createSong: (songData) => {
        return axiosClient.post('/songs', songData);
    },
    updateSong: (id, songData) => {
        return axiosClient.put(`/songs/${id}`, songData);
    },
    deleteSong: (id) => {
        return axiosClient.delete(`/songs/${id}`);
    }
};

export default songService;