import axiosClient from './axiosClient';

const songService = {
    getAllSongs:  ()           => axiosClient.get('/songs'),
    getSongById:  (id)         => axiosClient.get(`/songs/${id}`),
    createSong:   (data)       => axiosClient.post('/songs', data),
    updateSong:   (id, data)   => axiosClient.put(`/songs/${id}`, data),
    deleteSong:   (id)         => axiosClient.delete(`/songs/${id}`),
};

export default songService;