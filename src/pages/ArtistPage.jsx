import '../styles/ArtistPage.css';
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
            <div className="artist-header">
                <div className="artist-avatar-wrapper">
                    {artist.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.name} className="artist-avatar-img" />
                    ) : (
                        <div className="artist-avatar-fallback">
                            <FiUser className="text-6xl text-white/50" />
                        </div>
                    )}
                </div>
                <div className="artist-info">
                    <span className="artist-label">Nghệ sĩ</span>
                    <h2 className="artist-name">{artist.name}</h2>
                    {artist.bio && <p className="artist-bio">{artist.bio}</p>}
                    <div className="artist-meta-row">
                        <span>{artistSongs.length} bài hát</span>
                        {artistAlbums.length > 0 && (
                            <>
                                <span className="artist-meta-dot"></span>
                                <span>{artistAlbums.length} album</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Albums section if any */}
            {artistAlbums.length > 0 && (
                <div className="artist-section">
                    <h3 className="artist-section-title">Albums & Singles</h3>
                    <div className="artist-albums-grid">
                        {artistAlbums.map(album => (
                            <div
                                key={album.id}
                                onClick={() => navigate(`/album/${album.id}`)}
                                className="artist-album-card group"
                            >
                                <div className="artist-album-cover-wrapper">
                                    {album.coverUrl ? (
                                        <img src={album.coverUrl} alt={album.title} className="artist-album-cover-img" />
                                    ) : (
                                        <div className="artist-album-cover-fallback">
                                            <FiDisc className="text-3xl text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="artist-album-title">{album.title}</h4>
                                <p className="artist-album-type">{album.type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Songs section */}
            <div className="artist-section">
                <h3 className="artist-section-title">Bài hát</h3>
                {artistSongs.length === 0 ? (
                    <p className="artist-empty-text">Chưa có bài hát nào.</p>
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
