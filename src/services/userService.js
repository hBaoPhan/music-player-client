import axiosClient from './axiosClient';

const userService = {
    toggleFavorite:  (userId, songId)       => axiosClient.post(`/users/${userId}/favorites/${songId}`),
    getFavoriteSongs:(userId)               => axiosClient.get(`/users/${userId}/favorites`),
    getTopSongsThisMonth: (userId)          => axiosClient.get(`/users/${userId}/history/top-this-month`),
    getHistorySong:  (userId)               => axiosClient.get(`/users/${userId}/history`),
    addHistorySong:  (userId, songId, duration = 0) => axiosClient.post(`/users/${userId}/history/${songId}?duration=${duration}`),
    updateProfile:   (userId, profileData)  => axiosClient.put(`/users/${userId}`, profileData),
    getAllUsers:      ()                    => axiosClient.get('/users'),
    deleteUser:      (userId)               => axiosClient.delete(`/users/${userId}`),
    updateUserRole:  (userId, role)         => axiosClient.patch(`/users/${userId}/role`, { role }),
};

export default userService;
