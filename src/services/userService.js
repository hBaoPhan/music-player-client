import axiosClient from './axiosClient';

const userService = {
    toggleFavorite: (userId, songId)        => axiosClient.post(`/users/${userId}/favorites/${songId}`),
    getFavoriteSongs: (userId)              => axiosClient.get(`/users/${userId}/favorites`),
    updateProfile:  (userId, profileData)   => axiosClient.put(`/users/${userId}`, profileData),
    getAllUsers:     ()                      => axiosClient.get('/users'),
    deleteUser:     (userId)                => axiosClient.delete(`/users/${userId}`),
};

export default userService;
