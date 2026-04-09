import axiosClient from './axiosClient';

const userService = {
    toggleFavorite: async (userId, songId) => {
        return axiosClient.post(`/users/${userId}/favorites/${songId}`);
    },
    getFavoriteSongs: async (userId) => {
        return axiosClient.get(`/users/${userId}/favorites`);
    },
    updateProfile: async (userId, profileData) => {
        return axiosClient.put(`/users/${userId}`, profileData);
    },
    getAllUsers: async () => {
        return axiosClient.get('/users');
    },
    deleteUser: async (userId) => {
        return axiosClient.delete(`/users/${userId}`);
    }
};

export default userService;
