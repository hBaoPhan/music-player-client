import '../styles/Playlist.css';
import React, { useState, useEffect } from 'react';
import { FiMusic, FiPlay, FiHeart, FiPlus } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import SongCard from '../components/SongCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePlayer } from '../context/PlayerContext';
import songService from '../services/songService';
import userService from '../services/userService';
import artistService from '../services/artistService';

const SongPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, getUser } = useAuth();
    const { showToast } = useToast();
    const { currentSong, isPlaying, setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();

    const [song, setSong] = useState(null);
    const [relatedSongs, setRelatedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
    
    // Derived state
    const isFavorite = currentUser?.favoriteSongs?.some(fav => fav.id === parseInt(id));
    const isThisSongPlaying = currentSong?.id === parseInt(id);

    useEffect(() => {
        const fetchSongData = async () => {
            try {
                setLoading(true);
                const songData = await songService.getSongById(id);
                const actualSong = songData.data || songData;
                setSong(actualSong);

                if (actualSong.artist?.id) {
                    const artistSongs = await artistService.getArtistSongs(actualSong.artist.id);
                    const actualArtistSongs = artistSongs.data || artistSongs;
                    setRelatedSongs(actualArtistSongs.filter(s => s.id !== actualSong.id).slice(0, 10)); // limit to 10
                }
            } catch (error) {
                console.error("Lỗi khi tải thông tin bài hát:", error);
                showToast('Lỗi khi tải thông tin bài hát', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSongData();
        }
    }, [id, showToast]);

    const handlePlayPause = () => {
        if (!song) return;
        if (isThisSongPlaying) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentSong(song);
            setIsPlaying(true);
            setSongQueue([song, ...relatedSongs]);
        }
    };

    const handleToggleFavorite = async () => {
        if (!currentUser) {
            showToast('Vui lòng đăng nhập để sử dụng tính năng này', 'info');
            return;
        }
        try {
            if (isFavorite) {
                await userService.removeFavoriteSong(currentUser.id, song.id);
                showToast('Đã gỡ khỏi danh sách yêu thích', 'success');
            } else {
                await userService.addFavoriteSong(currentUser.id, song.id);
                showToast('Đã thêm vào danh sách yêu thích', 'success');
            }
            await getUser(); // Cập nhật lại thông tin user
        } catch (error) {
            console.error("Lỗi khi cập nhật danh sách yêu thích:", error);
            showToast('Có lỗi xảy ra', 'error');
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="loading-text">Đang tải thông tin bài hát...</div>;
    }

    if (!song) {
        return <div className="loading-text">Không tìm thấy bài hát.</div>;
    }

    return (
        <div className="home-container">
            <div className="flex items-end gap-6 mb-8 px-2">
                <div className="w-48 h-48 shrink-0 rounded-xl overflow-hidden shadow-2xl relative group">
                    {song.album?.coverUrl ? (
                        <img src={song.album.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                            <FiMusic className="text-7xl text-white/50" />
                        </div>
                    )}
                    <button 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handlePlayPause}
                    >
                        <FiPlay className="text-5xl text-white ml-2" />
                    </button>
                </div>
                
                <div className="flex flex-col gap-3 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Bài hát</span>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white">{song.title}</h2>
                    
                    <div className="flex items-center gap-2 mt-2 text-base text-gray-300">
                        <span 
                            className="font-bold text-white hover:underline cursor-pointer"
                            onClick={() => song.artist?.id && navigate(`/artist/${song.artist.id}`)}
                        >
                            {song.artist?.name || 'Unknown Artist'}
                        </span>
                        
                        {song.album && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                <span 
                                    className="hover:underline cursor-pointer"
                                    onClick={() => navigate(`/album/${song.album.id}`)}
                                >
                                    {song.album.title}
                                </span>
                            </>
                        )}
                        
                        {song.duration && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                <span>{formatDuration(song.duration)}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <button 
                            className="w-14 h-14 bg-green-500 hover:bg-green-400 text-black rounded-full flex items-center justify-center transition-transform hover:scale-105"
                            onClick={handlePlayPause}
                        >
                            <FiPlay className="text-2xl ml-1" />
                        </button>
                        
                        <button 
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
                            onClick={handleToggleFavorite}
                            title={isFavorite ? "Gỡ khỏi danh sách yêu thích" : "Thêm vào yêu thích"}
                        >
                            <FiHeart className={`text-3xl ${isFavorite ? 'fill-green-500 text-green-500' : 'text-gray-400 hover:text-white'}`} />
                        </button>
                        
                        <button 
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                            onClick={() => setSelectedSongForPlaylist(song)}
                            title="Thêm vào danh sách phát"
                        >
                            <FiPlus className="text-3xl" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Songs section */}
            {relatedSongs.length > 0 && (
                <div className="px-2 mt-12">
                    <h3 className="text-2xl font-bold text-white mb-6">Thêm từ {song.artist?.name}</h3>
                    <div className="song-grid">
                        {relatedSongs.map((relatedSong) => (
                            <SongCard
                                key={relatedSong.id}
                                song={relatedSong}
                                onClick={() => {
                                    setCurrentSong(relatedSong);
                                    setIsPlaying(true);
                                    setSongQueue(relatedSongs);
                                }}
                                onAddToPlaylist={setSelectedSongForPlaylist}
                            />
                        ))}
                    </div>
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

export default SongPage;
