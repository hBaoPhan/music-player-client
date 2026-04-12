import axiosClient from './axiosClient';

const artistService = {
    getAllArtists: () => {
        return axiosClient.get('/artists');
    },
    getArtistById: (id) => {
        return axiosClient.get(`/artists/${id}`);
    }
};

export default artistService;
