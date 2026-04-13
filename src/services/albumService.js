import axiosClient from './axiosClient';

const albumService = {
    getAllAlbums: () => axiosClient.get('/albums'),
    getAlbumById: (id) => axiosClient.get(`/albums/${id}`),
    createAlbum: (data) => axiosClient.post('/albums', data),
    updateAlbum: (id, data) => axiosClient.put(`/albums/${id}`, data),
    deleteAlbum: (id) => axiosClient.delete(`/albums/${id}`),
};

export default albumService;
