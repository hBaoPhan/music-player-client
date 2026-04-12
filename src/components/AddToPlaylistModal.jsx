import '../styles/AddToPlaylistModal.css';
import React, { useState, useEffect } from 'react';
import playlistService from '../services/playlistService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiX, FiPlus } from 'react-icons/fi';

const AddToPlaylistModal = ({ song, onClose }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (currentUser) {
                try {
                    const data = await playlistService.getUserPlaylists(currentUser.id);
                    setPlaylists(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error("Lỗi khi tải danh sách playlist:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPlaylists();
    }, [currentUser]);

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        setCreating(true);
        try {
            const newPlaylist = await playlistService.createPlaylist({
                name: newPlaylistName,
                userId: currentUser.id
            });
            console.log('Backend trả về danh sách mới:', newPlaylist);
            setPlaylists([...(Array.isArray(playlists) ? playlists : []), newPlaylist]);
            showToast('Đã tạo danh sách phát mới!', 'success');
            setNewPlaylistName('');
        } catch (error) {
            console.error("Lỗi khi tạo playlist:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        try {
            const result = await playlistService.addSongToPlaylist(playlistId, song.id);
            console.log('Backend trả về khi thêm bài hát:', result);
            showToast('Đã thêm bài hát vào danh sách phát!', 'success');
            onClose();
        } catch (error) {
            console.error("Lỗi khi thêm bài hát vào playlist:", error);
            showToast('Không thể thêm bài hát vào danh sách!', 'error');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>
                    <FiX />
                </button>
                <h3 className="modal-title">Thêm vào danh sách phát</h3>

                <div className="create-playlist-section">
                    <input
                        type="text"
                        placeholder="Tên danh sách mới..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        className="new-playlist-input"
                    />
                    <button
                        className="create-playlist-btn"
                        onClick={handleCreatePlaylist}
                        disabled={creating || !newPlaylistName.trim()}
                    >
                        <FiPlus />
                    </button>
                </div>

                <div className="playlists-list">
                    {loading ? (
                        <p className="text-gray-400">Đang tải...</p>
                    ) : !playlists ? (
                        <p className="text-gray-400">Bạn chưa có danh sách nào.</p>
                    ) : (
                        playlists.map((playlist) => {
                            const isSongInPlaylist = playlist?.songs?.some(s => s.id === song.id);
                            return (
                                <div
                                    key={playlist?.id}
                                    className={`playlist-item ${isSongInPlaylist ? 'disabled' : ''}`}
                                    onClick={() => !isSongInPlaylist && handleAddToPlaylist(playlist.id)}
                                >
                                    <span>{playlist.name}</span>
                                    {isSongInPlaylist && <span className="text-xs text-gray-500">Đã có</span>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;
