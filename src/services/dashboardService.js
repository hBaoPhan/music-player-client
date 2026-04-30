import axiosClient from './axiosClient';

const dashboardService = {
    getStats: () => axiosClient.get('/admin/dashboard'),
};

export default dashboardService;
