import axiosClient from './axiosClient';

const authService = {
    login:          (username, password)                    => axiosClient.post('/auth/login', { username, password }),
    register:       (username, password, email)             => axiosClient.post('/auth/register', { username, password, email }),
    forgotPassword: (email)                                 => axiosClient.post('/auth/forgot-password', { email }),
    changePassword: (username, oldPassword, newPassword)    => axiosClient.post('/auth/change-password', { username, oldPassword, newPassword }),
    refreshToken:   (refreshToken)                          => axiosClient.post('/auth/refresh', { refreshToken }),
};

export default authService;