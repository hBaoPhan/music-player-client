import '../styles/Playlist.css';
import React, { useState, useEffect } from 'react';
import { FiUser, FiPlay, FiDisc } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import SongCard from '../components/SongCard';
import { useToast } from '../context/ToastContext';
import { usePlayer } from '../context/PlayerContext';
import artistService from '../services/artistService';

const ArtistPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();

    const [artist, setArtist] = useState(null);
    const [artistSongs, setArtistSongs] = useState([]);
    const [artistAlbums, setArtistAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                setLoading(true);
                const artistData = await artistService.getArtistById(id);
                setArtist(artistData.data || artistData);

                const songsData = await artistService.getArtistSongs(id);
                setArtistSongs(songsData.data || songsData);

                const albumsData = await artistService.getArtistAlbums(id);
                setArtistAlbums(albumsData.data || albumsData);
            } catch (error) {
                console.error("Lỗi khi tải thông tin nghệ sĩ:", error);
                showToast('Lỗi khi tải thông tin nghệ sĩ', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArtistData();
        }
    }, [id, showToast]);

    const handlePlaySong = (song, songsQueue) => {
        setCurrentSong(song);
        setIsPlaying(true);
        setSongQueue(songsQueue);
    };

    if (loading) {
        return <div className="loading-text">Đang tải thông tin nghệ sĩ...</div>;
    }

    if (!artist) {
        return <div className="loading-text">Không tìm thấy nghệ sĩ.</div>;
    }

    return (
        <div className="home-container">
            <div className="flex items-end gap-6 mb-8 px-2">
                <div className="w-48 h-48 shrink-0 rounded-full overflow-hidden shadow-2xl border-4 border-gray-800">
                    {artist.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                            <FiUser className="text-6xl text-white/50" />
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Nghệ sĩ</span>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white">{artist.name}</h2>
                    {artist.bio && <p className="text-sm text-gray-300 max-w-2xl mt-2 line-clamp-3">{artist.bio}</p>}
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                        <span>{artistSongs.length} bài hát</span>
                        {artistAlbums.length > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                <span>{artistAlbums.length} album</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Albums section if any */}
            {artistAlbums.length > 0 && (
                <div className="mb-10 px-2">
                    <h3 className="text-2xl font-bold text-white mb-4">Albums & Singles</h3>
                    <div className="flex flex-wrap gap-4">
                        {artistAlbums.map(album => (
                            <div 
                                key={album.id} 
                                onClick={() => navigate(`/album/${album.id}`)}
                                className="w-40 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors group"
                            >
                                <div className="w-full aspect-square rounded-lg overflow-hidden mb-3 relative">
                                    {album.coverUrl ? (
                                        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <FiDisc className="text-3xl text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-semibold text-white truncate">{album.title}</h4>
                                <p className="text-xs text-gray-400 capitalize mt-1">{album.type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Songs section */}
            <div className="px-2">
                <h3 className="text-2xl font-bold text-white mb-4">Bài hát</h3>
                {artistSongs.length === 0 ? (
                    <p className="text-gray-400 text-lg">Chưa có bài hát nào.</p>
                ) : (
                    <div className="song-grid">
                        {artistSongs.map((song) => (
                            <SongCard
                                key={song.id}
                                song={song}
                                onClick={() => handlePlaySong(song, artistSongs)}
                                onAddToPlaylist={setSelectedSongForPlaylist}
                            />
                        ))}
                    </div>
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

export default ArtistPage;
