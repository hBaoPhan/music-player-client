import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import userService from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPlay, FiPlus, FiMoreHorizontal, FiMusic } from 'react-icons/fi';
import { BsCheckCircleFill } from 'react-icons/bs';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import '../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { setCurrentSong, setIsPlaying, setSongQueue, songQueue } = usePlayer() || {};
    const [topTracks, setTopTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const fetchTopTracks = async () => {
            try {
                const response = await userService.getTopSongsThisMonth(currentUser.id);
                setTopTracks(response);
            } catch (error) {
                console.error("Lỗi khi tải bài hát top tháng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopTracks();
    }, [currentUser]);

    const handlePlaySong = (song) => {
        if (setCurrentSong && setIsPlaying) {
            if (setSongQueue) {
                setSongQueue(topTracks);
            }
            setCurrentSong(song);
            setIsPlaying(true);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    if (!currentUser) {
        return <div className="text-white p-8">Vui lòng đăng nhập để xem hồ sơ.</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-wrapper">
                    <span className="profile-avatar-text">{getInitial(currentUser.username)}</span>
                </div>
                <div className="profile-info">
                    <span className="profile-label">Profile</span>
                    <h1 className="profile-name">{currentUser.username}</h1>
                    <div className="profile-stats">
                        <span>{currentUser.playlists ? currentUser.playlists.length : 0} Public Playlists</span>
                        <span className="profile-stats-dot">•</span>
                        <span>0 Following</span>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-section-title-wrapper">
                    <div>
                        <h2 className="profile-section-title">Nhạc say đắm tháng này</h2>
                    </div>
                    <span className="profile-show-all">Hiện tất cả</span>
                </div>

                {loading ? (
                    <div className="text-gray-400 mt-4">Đang tải...</div>
                ) : topTracks.slice(0, 5).length > 0 ? (
                    <div className="top-tracks-list">
                        {topTracks.slice(0, 5).map((song, index) => {
                            const isFav = currentUser?.favoriteSongs?.some(fav => fav.id === song.id);
                            return (
                                <div
                                    key={song.id}
                                    className="track-item group"
                                    onDoubleClick={() => handlePlaySong(song)}
                                >
                                    <div className="track-index" onClick={() => handlePlaySong(song)}>
                                        <span className="track-index-number">{index + 1}</span>
                                        <FiPlay className="track-play-icon" />
                                    </div>
                                    <div className="track-image-wrapper">
                                        {song.album?.coverUrl ? (
                                            <img src={song.album.coverUrl} alt={song.title} className="track-image" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700"></div>
                                        )}
                                    </div>
                                    <div className="track-info">
                                        <span className="track-title">{song.title}</span>
                                        <span className="track-artist">{song.artist?.name || 'Unknown Artist'}</span>
                                    </div>
                                    <div className="track-album">
                                        {song.album ? song.album.title : 'Unknown Album'}
                                    </div>
                                    <div className="track-actions">
                                        {isFav ? (
                                            <BsCheckCircleFill className="track-fav-icon" />
                                        ) : (
                                            <button
                                                className="track-action-btn"
                                                title="Thêm vào danh sách phát"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSongForPlaylist(song);
                                                }}
                                            >
                                                <FiPlus />
                                            </button>
                                        )}
                                    </div>
                                    <div className="track-duration">
                                        {formatDuration(song.duration)}
                                    </div>
                                    <button className="track-actions-more" title="Thêm tuỳ chọn">
                                        <FiMoreHorizontal />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-gray-400 mt-4">Chưa có bài hát nào được nghe trong tháng này.</div>
                )}

                <div className="profile-section-title-wrapper mt-12">
                    <div>
                        <h2 className="profile-section-title">Danh sách phát công khai</h2>
                    </div>
                </div>

                {currentUser?.playlists?.length > 0 ? (
                    <div className="profile-playlists-grid">
                        {currentUser.playlists.map(playlist => (
                            <div
                                key={playlist.id}
                                className="profile-playlist-card group"
                                onClick={() => navigate('/playlist')}
                            >
                                <div className="profile-playlist-icon-wrapper">
                                    <FiMusic className="text-white text-4xl" />
                                </div>
                                <h3 className="profile-playlist-title">{playlist.name}</h3>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 mt-4 pb-8">Chưa có danh sách phát nào.</div>
                )}
            </div>

            {selectedSongForPlaylist && (
                <AddToPlaylistModal
                    song={selectedSongForPlaylist}
                    onClose={() => setSelectedSongForPlaylist(null)}
                />
            )}
        </div>
    );
};

export default Profile;
