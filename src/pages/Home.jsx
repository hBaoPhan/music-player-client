import React, { useState, useEffect } from 'react';
import { FiPlay, FiHeart, FiPlus } from 'react-icons/fi';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import songService from '../services/songService';
import userService from '../services/userService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Home = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser, getUser } = useAuth();
    const { showToast } = useToast();
    const { currentSong, setCurrentSong, isPlaying, setIsPlaying, setSongQueue } = usePlayer();
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

    const handlePlaySong = (song) => {
        setCurrentSong(song);
        setIsPlaying(true);
        setSongQueue(songs);
    };

    useEffect(() => {
        const hasShownWarning = sessionStorage.getItem('hasShownStudyWarning');
        if (!hasShownWarning) {
            showToast('Ứng dụng chỉ phục vụ mục đích học tập!', 'warning');
            sessionStorage.setItem('hasShownStudyWarning', 'true');
        }
    }, [])

    const handleToggleFavorite = async (e, song) => {
        e.stopPropagation();
        if (!currentUser) {
            showToast('Vui lòng đăng ký hoặc đăng nhập để sử dụng tính năng này!', 'error');
            return;
        }

        try {
            await userService.toggleFavorite(currentUser.id, song.id);
            await getUser();
        } catch (error) {
            console.error("Lỗi khi thêm vào yêu thích:", error);
        }
    };

    const isFavorite = (songId) => {
        return currentUser?.favoriteSongs?.some(fav => fav.id === songId);
    };

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const data = await songService.getAllSongs();
                setSongs(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách bài hát:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    if (loading) {
        return <div className="loading-text">Đang tải danh sách bài hát...</div>;
    }

    return (
        <div className="home-container">
            <h2 className="section-title">Dành cho {currentUser?.username}</h2>

            <div className="song-grid">
                {songs.map((song) => {
                    const favorited = isFavorite(song.id);
                    return (
                        <div key={song.id} className="song-card group" onClick={() => { handlePlaySong(song) }}  >
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
                                    className="favorite-button-overlay"
                                    onClick={(e) => handleToggleFavorite(e, song)}
                                >
                                    <FiHeart className={`text-2xl transition-colors ${favorited ? 'fill-green-500 text-green-500' : 'text-white hover:text-green-500'}`} />
                                </button>

                                <button
                                    className="add-playlist-btn-overlay"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!currentUser) {
                                            showToast('Vui lòng đăng ký hoặc đăng nhập để sử dụng tính năng này!', 'error');
                                            return;
                                        }
                                        setSelectedSongForPlaylist(song);
                                    }}
                                    title="Thêm vào danh sách phát"
                                >
                                    <FiPlus />
                                </button>
                            </div>

                            <h3 className="song-title">{song.title}</h3>
                            <p className="song-artist">{song.artist?.name || "Unknown Artist"}</p>
                        </div>
                    );
                })}
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

export default Home;