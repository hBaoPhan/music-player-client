import axiosClient from './axiosClient';

const authService = {
    login: (username, password) => {
        let res = axiosClient.post('/auth/login', { username, password });
        return res
    },

    register: (username, password, email) => {
        return axiosClient.post('/auth/register', { username, password, email });
    },

    forgotPassword: (email) => {
        return axiosClient.post('/auth/forgot-password', { email });
    }
};

export default authService;