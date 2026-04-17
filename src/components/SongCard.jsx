import React from 'react';
import { FiPlay, FiHeart, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import userService from '../services/userService';

const SongCard = ({ 
    song, 
    onClick, 
    onAddToPlaylist, 
    showFavorite = true, 
    showAddToPlaylist = true,
    customAction
}) => {
    const { currentUser, getUser } = useAuth();
    const { showToast } = useToast();

    const isFavorite = currentUser?.favoriteSongs?.some(fav => fav.id === song.id);

    const handleToggleFavorite = async (e) => {
        e.stopPropagation();
        if (!currentUser) {
            showToast('Vui lòng đăng ký hoặc đăng nhập để sử dụng tính năng này!', 'error');
            return;
        }

        try {
            await userService.toggleFavorite(currentUser.id, song.id);
            if (getUser) {
                await getUser();
            }
        } catch (error) {
            console.error("Lỗi khi thêm/xóa yêu thích:", error);
        }
    };

    const handleAddToPlaylistClick = (e) => {
        e.stopPropagation();
        if (!currentUser) {
            showToast('Vui lòng đăng ký hoặc đăng nhập để sử dụng tính năng này!', 'error');
            return;
        }
        if (onAddToPlaylist) {
            onAddToPlaylist(song);
        }
    };

    const handlePlayClick = (e) => {
        e.stopPropagation(); 
        if (onClick) {
            onClick(song);
        }
    };

    return (
        <div className="song-card group" onClick={() => onClick && onClick(song)}>
            <div className="song-image-wrapper">
                <img
                    src={song.album?.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80"}
                    alt={song.title}
                    className="song-image"
                />
                <button className="play-button-overlay" onClick={handlePlayClick}>
                    <FiPlay className="text-xl ml-1" />
                </button>

                {showFavorite && (
                    <button
                        className="favorite-button-overlay"
                        onClick={handleToggleFavorite}
                        title={isFavorite ? "Gỡ khỏi danh sách yêu thích" : "Thêm vào yêu thích"}
                    >
                        <FiHeart className={`text-2xl transition-colors ${isFavorite ? 'fill-green-500 text-green-500 hover:text-red-500 hover:fill-red-500' : 'text-white hover:text-green-500'}`} />
                    </button>
                )}

                {showAddToPlaylist && (
                    <button
                        className="add-playlist-btn-overlay"
                        onClick={handleAddToPlaylistClick}
                        title="Thêm vào danh sách phát"
                    >
                        <FiPlus />
                    </button>
                )}
                
                {customAction && customAction(song)}
            </div>

            <div className="song-bottom-info mt-3">
                <h3 className="song-title">{song.title}</h3>
                <p className="song-artist">{song.artist?.name || "Unknown Artist"}</p>
                <div className="song-meta-row">
                    <span className="song-album">{song.album ? (song.album.type === "SINGLE" ? "Single" : `${song.album.type}: ${song.album.title}`) : "Unknown Album"}</span>
                    {song.genre && <span className="song-genre">{song.genre}</span>}
                </div>
            </div>
        </div>
    );
};

export default SongCard;
