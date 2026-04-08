import React, { useState } from 'react';
import { FiPlay, FiHeart, FiPlus } from 'react-icons/fi';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import userService from '../services/userService';

const Favorites = () => {
    const { currentUser, getUser } = useAuth();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

    const handlePlaySong = (song, songsQueue) => {
        setCurrentSong(song);
        setIsPlaying(true);
        setSongQueue(songsQueue);
    };

    const handleToggleFavorite = async (e, song) => {
        e.stopPropagation();
        if (!currentUser) return;
        
        try {
            await userService.toggleFavorite(currentUser.id, song.id);
            await getUser();
        } catch (error) {
            console.error("Lỗi khi loại bỏ yêu thích:", error);
        }
    };

    const favoriteSongs = currentUser?.favoriteSongs || [];

    return (
        <div className="home-container">
            <h2 className="section-title">Bài Hát Yêu Thích Của Bạn</h2>

            {favoriteSongs.length === 0 ? (
                <p className="text-gray-400 text-lg">Bạn chưa có bài hát yêu thích nào. Hãy thả tim một bài hát để xem tại đây.</p>
            ) : (
                <div className="song-grid">
                    {favoriteSongs.map((song) => (
                        <div key={song.id} className="song-card group" onClick={() => handlePlaySong(song, favoriteSongs)}>
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
                                    title="Gỡ khỏi danh sách yêu thích"
                                >
                                    <FiHeart className="text-2xl transition-colors fill-green-500 text-green-500 hover:text-red-500 hover:fill-red-500" />
                                </button>

                                <button
                                    className="add-playlist-btn-overlay"
                                    onClick={(e) => {
                                        e.stopPropagation();
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
                    ))}
                </div>
            )}

            {selectedSongForPlaylist && (
                <AddToPlaylistModal 
                    song={selectedSongForPlaylist} 
                    onClose={() => setSelectedSongForPlaylist(null)} 
                />
            )}
        </div>
    );
};

export default Favorites;
