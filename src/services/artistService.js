import axiosClient from './axiosClient';

const artistService = {
    getAllArtists: () => axiosClient.get('/artists'),
    getArtistById: (id) => axiosClient.get(`/artists/${id}`),
    createArtist: (data) => axiosClient.post('/artists', data),
    updateArtist: (id, data) => axiosClient.put(`/artists/${id}`, data),
    deleteArtist: (id) => axiosClient.delete(`/artists/${id}`),
};

export default artistService;
