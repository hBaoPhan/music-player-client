import axiosClient from './axiosClient';

const albumService = {
    getAllAlbums: () => {
        return axiosClient.get('/albums');
    },
    getAlbumById: (id) => {
        return axiosClient.get(`/albums/${id}`);
    }
};

export default albumService;
