import '../styles/Playlist.css';
import React, { useState, useEffect } from 'react';
import { FiPlay, FiHeart, FiPlus, FiDisc } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import SongCard from '../components/SongCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePlayer } from '../context/PlayerContext';
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


    if (loading) {
        return <div className="loading-text">Đang tải thông tin album...</div>;
    }

    if (!album) {
        return <div className="loading-text">Không tìm thấy album.</div>;
    }

    return (
        <div className="home-container">
            <div className="flex items-end gap-6 mb-8 px-2">
                <div className="w-48 h-48 shrink-0 rounded-xl overflow-hidden shadow-2xl">
                    {album.coverUrl ? (
                        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
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
                    {albumSongs.map((song) => (
                        <SongCard
                            key={song.id}
                            song={song}
                            onClick={() => handlePlaySong(song, albumSongs)}
                            onAddToPlaylist={setSelectedSongForPlaylist}
                        />
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

export default AlbumPage;
