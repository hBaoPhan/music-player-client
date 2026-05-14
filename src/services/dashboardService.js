import axiosClient from './axiosClient';

const dashboardService = {
    // Admin-only full dashboard
    getStats: () => axiosClient.get('/admin/dashboard'),

    // Public chart endpoints (under /songs)
    getTrending: () => axiosClient.get('/songs/trending'),
    getTopFavorites: () => axiosClient.get('/songs/top-favorites'),
    getGenreDistribution: () => axiosClient.get('/songs/genre-stats'),

    // Charts: trending artists (under /artists)
    getTrendingArtists: (limit = 5) => axiosClient.get(`/artists/trending?limit=${limit}`),
};

export default dashboardService;
