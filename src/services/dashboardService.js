import axiosClient from './axiosClient';

const dashboardService = {
    // Admin-only full dashboard
    getStats: () => axiosClient.get('/admin/dashboard'),

    // Public chart endpoints (under /songs)
    getTrending: () => axiosClient.get('/songs/trending'),
    getTopFavorites: () => axiosClient.get('/songs/top-favorites'),
    getGenreDistribution: () => axiosClient.get('/songs/genre-stats'),
};

export default dashboardService;
