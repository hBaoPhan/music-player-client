import axiosClient from './axiosClient';

const playlistService = {
    getUserPlaylists: async (userId) => {
        return await axiosClient.get(`/playlists/user/${userId}`);
    },

    getPlaylistById: async (id) => {
        return await axiosClient.get(`/playlists/${id}`);
    },

    createPlaylist: async (playlistData) => {
        return await axiosClient.post('/playlists', {
            ...playlistData,
            createdAt: new Date().toISOString()
        });
    },

    deletePlaylist: async (id) => {
        return await axiosClient.delete(`/playlists/${id}`);
    },

    addSongToPlaylist: async (playlistId, songId) => {
        return await axiosClient.post(`/playlists/${playlistId}/songs/${songId}`);
    },

    removeSongFromPlaylist: async (playlistId, songId) => {
        return await axiosClient.delete(`/playlist-songs/playlist/${playlistId}/song/${songId}`);
    }
};

export default playlistService;
