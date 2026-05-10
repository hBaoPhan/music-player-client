import axiosClient from './axiosClient';

const authService = {
    login:          (username, password)                    => axiosClient.post('/auth/login', { username, password }),
    register:       (username, password, email)             => axiosClient.post('/auth/register', { username, password, email }),
    forgotPassword: (email)                                 => axiosClient.post('/auth/forgot-password', { email }),
    changePassword: (username, oldPassword, newPassword)    => axiosClient.post('/auth/change-password', { username, oldPassword, newPassword }),
    refreshToken:   (username, refreshToken)                => axiosClient.post('/auth/refresh', { username, refreshToken }),
    logout:         (username, refreshToken, allDevices)    => axiosClient.post('/auth/logout', { username, refreshToken, allDevices }),
};

export default authService;