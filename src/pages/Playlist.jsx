import '../styles/Playlist.css';
import React, { useState, useEffect } from 'react';
import { FiPlay, FiTrash2, FiPlus, FiArrowLeft, FiMusic } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePlayer } from '../context/PlayerContext';
import playlistService from '../services/playlistService';

const Playlist = () => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
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
            setPlaylists(data || []);
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
            setPlaylists([...playlists, newPlaylist]);
            showToast('Tạo danh sách phát thành công!', 'success');
            setNewPlaylistName('');
            setShowCreateModal(false);
        } catch (error) {
            console.error("Lỗi khi tạo playlist:", error);
            showToast('Không thể tạo danh sách phát!', 'error');
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
            showToast('Đã xóa danh sách phát!', 'success');
            if (selectedPlaylist?.id === id) {
                setSelectedPlaylist(null);
            }
        } catch (error) {
            console.error("Lỗi khi xóa playlist:", error);
            showToast('Không thể xóa danh sách phát!', 'error');
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
            showToast('Đã xóa bài hát khỏi danh sách phát!', 'success');
        } catch (error) {
            console.error("Lỗi khi xóa bài hát khỏi playlist:", error);
            showToast('Không thể xóa bài hát khỏi danh sách!', 'error');
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

                                <div className="song-bottom-info mt-3">
                                    <h3 className="song-title">{song.title}</h3>
                                    <p className="song-artist">{song.artist?.name || "Unknown Artist"}</p>
                                    <div className="song-meta-row">
                                        <span className="song-album">Album: {song.album?.title || "Single"}</span>
                                        {song.genre && <span className="song-genre">{song.genre}</span>}
                                    </div>
                                </div>
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
                            <div className="playlist-container">
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