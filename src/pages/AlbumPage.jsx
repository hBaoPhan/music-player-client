import '../styles/Playlist.css';
import React, { useState, useEffect } from 'react';
import { FiPlay, FiHeart, FiPlus, FiDisc } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePlayer } from '../context/PlayerContext';
import userService from '../services/userService';
import songService from '../services/songService';
import albumService from '../services/albumService';

const AlbumPage = () => {
    const { id } = useParams();
    const { currentUser, getUser } = useAuth();
    const { showToast } = useToast();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();
    
    const [album, setAlbum] = useState(null);
    const [albumSongs, setAlbumSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

    useEffect(() => {
        const fetchAlbumData = async () => {
            try {
                setLoading(true);
                const albumData = await albumService.getAlbumById(id);
                setAlbum(albumData);
                
                const allSongs = await songService.getAllSongs();
                const filteredSongs = allSongs.filter(s => s.album?.id === parseInt(id));
                setAlbumSongs(filteredSongs);
            } catch (error) {
                console.error("Lỗi khi tải album:", error);
                showToast('Lỗi khi tải thông tin album', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAlbumData();
        }
    }, [id, showToast]);

    const handlePlaySong = (song, songsQueue) => {
        setCurrentSong(song);
        setIsPlaying(true);
        setSongQueue(songsQueue);
    };
    
    const handleToggleFavorite = async (e, song) => {
        e.stopPropagation();
        if (!currentUser) {
            showToast('Vui lòng đăng nhập để sử dụng tính năng này!', 'error');
            return;
        }
        try {
            await userService.toggleFavorite(currentUser.id, song.id);
            await getUser();
        } catch (error) {
            console.error("Lỗi khi thay đổi yêu thích:", error);
        }
    };

    const isFavorite = (songId) => {
        return currentUser?.favoriteSongs?.some(fav => fav.id === songId);
    };

    if (loading) {
        return <div className="loading-text">Đang tải thông tin album...</div>;
    }

    if (!album) {
        return <div className="loading-text">Không tìm thấy album.</div>;
    }

    return (
        <div className="home-container">
            <div className="flex items-end gap-6 mb-8 px-2">
                <div className="w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl">
                    {album.coverUrl ? (
                        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                            <FiDisc className="text-6xl text-white/50" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Album</span>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white">{album.title}</h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                        <span className="font-semibold text-white">{album.artist?.name || 'Unknown Artist'}</span>
                        {album.releaseDate && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                <span>{new Date(album.releaseDate).getFullYear()}</span>
                            </>
                        )}
                        <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                        <span>{albumSongs.length} bài hát</span>
                    </div>
                </div>
            </div>

            {albumSongs.length === 0 ? (
                <p className="text-gray-400 text-lg px-2">Album này chưa có bài hát nào.</p>
            ) : (
                <div className="song-grid">
                    {albumSongs.map((song) => {
                        const favorited = isFavorite(song.id);
                        return (
                            <div key={song.id} className="song-card group" onClick={() => handlePlaySong(song, albumSongs)}>
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
                                        title={favorited ? "Gỡ khỏi danh sách yêu thích" : "Thêm vào yêu thích"}
                                    >
                                        <FiHeart className={`text-2xl transition-colors ${favorited ? 'fill-green-500 text-green-500 hover:text-red-500 hover:fill-red-500' : 'text-white hover:text-green-500'}`} />
                                    </button>

                                    <button
                                        className="add-playlist-btn-overlay"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!currentUser) {
                                                showToast('Vui lòng đăng nhập để sử dụng tính năng này!', 'error');
                                                return;
                                            }
                                            setSelectedSongForPlaylist(song);
                                        }}
                                        title="Thêm vào danh sách phát"
                                    >
                                        <FiPlus />
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
                        );
                    })}
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

export default AlbumPage;
