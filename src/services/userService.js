import axiosClient from './axiosClient';

const userService = {
    toggleFavorite: async (userId, songId) => {
        return axiosClient.post(`/users/${userId}/favorites/${songId}`);
    },
    getFavoriteSongs: async (userId) => {
        return axiosClient.get(`/users/${userId}/favorites`);
    }
};

export default userService;
