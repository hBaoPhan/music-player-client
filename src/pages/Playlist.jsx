import React, { useState, useEffect } from 'react';
import { FiPlay, FiTrash2, FiPlus, FiArrowLeft, FiMusic } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import playlistService from '../services/playlistService';
import '../styles/Home.css';
import '../styles/Playlist.css';

const Playlist = () => {
    const { currentUser } = useAuth();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();

    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [loadingSongs, setLoadingSongs] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchPlaylists();
    }, [currentUser]);

    const fetchPlaylists = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const data = await playlistService.getUserPlaylists(currentUser.id);
            setPlaylists(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi khi tải playlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        setCreating(true);
        try {
            const newPlaylist = await playlistService.createPlaylist({
                name: newPlaylistName,
                userId: currentUser.id
            });
            console.log('Backend trả về playlist:', newPlaylist);
            setPlaylists([...(Array.isArray(playlists) ? playlists : []), newPlaylist]);
            setNewPlaylistName('');
            setShowCreateModal(false);
        } catch (error) {
            console.error("Lỗi khi tạo playlist:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeletePlaylist = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc muốn xóa danh sách này?")) return;

        try {
            await playlistService.deletePlaylist(id);
            setPlaylists(playlists.filter(p => p.id !== id));
            if (selectedPlaylist?.id === id) {
                setSelectedPlaylist(null);
            }
        } catch (error) {
            console.error("Lỗi khi xóa playlist:", error);
        }
    };

    const handleSelectPlaylist = async (playlist) => {
        setSelectedPlaylist(playlist);
        setLoadingSongs(true);
        try {
            const data = await playlistService.getPlaylistById(playlist.id);
            // Assuming the API returns the songs in the 'songs' field
            setPlaylistSongs(data.songs || []);
        } catch (error) {
            console.error("Lỗi khi tải bài hát trong playlist:", error);
        } finally {
            setLoadingSongs(false);
        }
    };

    const handleRemoveSong = async (e, songId) => {
        e.stopPropagation();
        if (!window.confirm("Loại bỏ bài hát khỏi danh sách?")) return;

        try {
            await playlistService.removeSongFromPlaylist(selectedPlaylist.id, songId);
            setPlaylistSongs(playlistSongs.filter(s => s.id !== songId));
        } catch (error) {
            console.error("Lỗi khi xóa bài hát khỏi playlist:", error);
        }
    };

    const handlePlaySong = (song) => {
        setCurrentSong(song);
        setIsPlaying(true);
        setSongQueue(playlistSongs);
    };

    if (loading && !selectedPlaylist) {
        return <div className="loading-text">Đang tải danh sách phát...</div>;
    }

    if (!currentUser) {
        return <div className="loading-text">Vui lòng đăng nhập để xem danh sách phát.</div>;
    }

    // Render detailed view of a selected playlist
    if (selectedPlaylist) {
        return (
            <div className="home-container">
                <button
                    className="back-button"
                    onClick={() => setSelectedPlaylist(null)}
                >
                    <FiArrowLeft className="mr-2" /> Trở lại danh sách
                </button>

                <div className="playlist-header">
                    <div className="playlist-icon-large bg-gradient-to-br from-indigo-500 to-purple-600">
                        <FiMusic className="text-white text-5xl" />
                    </div>
                    <div className="playlist-info">
                        <h2>{selectedPlaylist.name}</h2>
                        <p>{playlistSongs.length} bài hát</p>
                    </div>
                </div>

                {loadingSongs ? (
                    <div className="loading-text">Đang tải bài hát...</div>
                ) : playlistSongs.length === 0 ? (
                    <p className="text-gray-400 text-lg mt-8">Danh sách này chưa có bài hát nào. Hãy tìm bài hát và thêm vào đây.</p>
                ) : (
                    <div className="song-grid mt-8">
                        {playlistSongs.map((song) => (
                            <div key={song.id} className="song-card group" onClick={() => handlePlaySong(song)}>
                                <div className="song-image-wrapper">
                                    <img
                                        src={song.album?.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80"}
                                        alt={song.title}
                                        className="song-image"
                                    />
                                    <button className="play-button-overlay">
                                        <FiPlay className="text-xl ml-1" />
                                    </button>

                                    <button
                                        className="remove-song-btn-overlay"
                                        onClick={(e) => handleRemoveSong(e, song.id)}
                                        title="Xóa khỏi playlist"
                                    >
                                        <FiTrash2 className="text-xl text-white" />
                                    </button>
                                </div>

                                <h3 className="song-title">{song.title}</h3>
                                <p className="song-artist">{song.artist?.name || "Unknown Artist"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Render list of playlists
    return (
        <div className="home-container">
            <div className="flex justify-between items-center mb-6">
                <h2 className="section-title mb-0">Danh Sách Của Bạn</h2>
                <button
                    className="create-playlist-main-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FiPlus className="mr-2" /> Tạo danh sách phát mới
                </button>
            </div>

            {playlists.length === 0 ? (
                <p className="text-gray-400 text-lg">Bạn chưa tạo danh sách phát nào.</p>
            ) : (
                <div className="playlists-grid">
                    {playlists.map(playlist => (
                        <div
                            key={playlist?.id}
                            className="playlist-card group"
                            onClick={() => playlist && handleSelectPlaylist(playlist)}
                        >
                            <div className="playlist-icon-cover bg-gradient-to-br from-gray-700 to-gray-900">
                                <FiMusic className="text-gray-400 text-4xl" />
                                <button
                                    className="delete-playlist-btn"
                                    onClick={(e) => playlist && handleDeletePlaylist(e, playlist.id)}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                            <h3 className="playlist-card-title">{playlist?.name}</h3>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Tạo danh sách mới</h3>
                        <div className="modal-input-group">
                            <input
                                type="text"
                                placeholder="Nhập tên danh sách..."
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                className="new-playlist-input"
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button
                                    className="cancel-create-btn"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="confirm-create-btn"
                                    onClick={handleCreatePlaylist}
                                    disabled={creating || !newPlaylistName.trim()}
                                >
                                    Tạo mới
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Playlist;