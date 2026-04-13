import axiosClient from './axiosClient';

const playlistService = {
    getUserPlaylists:       (userId)                => axiosClient.get(`/playlists/user/${userId}`),
    getPlaylistById:        (id)                    => axiosClient.get(`/playlists/${id}`),
    createPlaylist:         (playlistData)          => axiosClient.post('/playlists', {
                                                        ...playlistData,
                                                        createdAt: new Date().toISOString(),
                                                    }),
    deletePlaylist:         (id)                    => axiosClient.delete(`/playlists/${id}`),
    addSongToPlaylist:      (playlistId, songId)    => axiosClient.post(`/playlists/${playlistId}/songs/${songId}`),
    removeSongFromPlaylist: (playlistId, songId)    => axiosClient.delete(`/playlists/${playlistId}/songs/${songId}`),
};

export default playlistService;
