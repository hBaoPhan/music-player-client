import '../styles/Home.css';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FiChevronLeft, FiChevronRight, FiDisc, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import SongCard from '../components/SongCard';
import albumService from '../services/albumService';
import playlistService from '../services/playlistService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSongs } from '../context/SongsContext';

const shuffleArray = (items = []) => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
};

// Ghép collage 2x2 từ coverUrl của album thuộc 4 bài hát đầu tiên.
// Nếu không đủ 4 ảnh hợp lệ → hiển thị placeholder mặc định.
const PlaylistCoverCollage = ({ songs = [] }) => {
    const covers = songs
        .map(s => s.album?.coverUrl)
        .filter(Boolean)
        .slice(0, 4);

    // Chỉ hiển thị collage khi có đúng 4 ảnh
    if (covers.length < 4) {
        return (
            <div className="playlist-cover-placeholder">
                <FiList />
            </div>
        );
    }

    return (
        <div className="playlist-cover-collage">
            {covers.map((url, i) => (
                <img key={i} src={url} alt="" />
            ))}
        </div>
    );
};

const Home = () => {
    const { allSongs: songs, songsLoading: loading, refreshSongs } = useSongs();
    const [albums, setAlbums] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);

    const sliderRef = useRef(null);
    const albumSliderRef = useRef(null);
    const playlistSliderRef = useRef(null);

    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

    const shuffledSongs = useMemo(() => shuffleArray(songs), [songs]);
    const shuffledAlbums = useMemo(() => shuffleArray(albums), [albums]);

    const handlePlaySong = useCallback((song) => {
        setCurrentSong(song);
        setIsPlaying(true);
        setSongQueue(shuffledSongs);
    }, [setCurrentSong, setIsPlaying, setSongQueue, shuffledSongs]);


    useEffect(() => {
        const hasShownWarning = sessionStorage.getItem('hasShownStudyWarning');
        if (!hasShownWarning) {
            showToast('Ứng dụng chỉ phục vụ mục đích học tập!', 'warning');
            sessionStorage.setItem('hasShownStudyWarning', 'true');
        }
    }, []);

    useEffect(() => {
        refreshSongs();
    }, [refreshSongs]);

    useEffect(() => {
        if (!songs.length) return;
        const fetchAlbums = async () => {
            try {
                const albumsData = await albumService.getAllAlbums();
                const albumsDataFiltered = albumsData.filter((album) => {
                    let count = 0;
                    songs.forEach((song) => {
                        if (album.id === song.album?.id) count += 1;
                    });
                    return count >= 2;
                });
                setAlbums(albumsDataFiltered);
            } catch (error) {
                console.error('Lỗi khi tải album:', error);
            }
        };
        fetchAlbums();
    }, [songs]);

    // Fetch danh sách phát của người dùng
    useEffect(() => {
        if (!currentUser) return;
        playlistService.getUserPlaylists(currentUser.id)
            .then(data => setUserPlaylists(data || []))
            .catch(err => console.error('Lỗi khi tải playlist:', err));
    }, [currentUser]);


    if (loading) {
        return <div className="loading-text">Đang tải danh sách bài hát...</div>;
    }

    const showPlaylistSection = currentUser && userPlaylists.length > 0;

    return (
        <div className="home-container">

            {/* ===== SECTION: DÀNH CHO BẠN ===== */}
            <div className="section-header">
                <h2 className="section-title">Dành cho {currentUser?.username}</h2>
                <div className="slider-nav">
                    <button className="slider-btn" onClick={() => sliderRef.current?.scrollBy({ left: -800, behavior: 'smooth' })}>
                        <FiChevronLeft className="slider-icon" />
                    </button>
                    <button className="slider-btn" onClick={() => sliderRef.current?.scrollBy({ left: 800, behavior: 'smooth' })}>
                        <FiChevronRight className="slider-icon" />
                    </button>
                </div>
            </div>

            <div className="song-slider-track" ref={sliderRef}>
                {shuffledSongs.map((song) => (
                    <SongCard
                        key={song.id}
                        song={song}
                        onClick={() => handlePlaySong(song)}
                        onAddToPlaylist={setSelectedSongForPlaylist}
                    />
                ))}
            </div>

            {/* ===== SECTION: DANH SÁCH PHÁT ===== */}
            {showPlaylistSection && (
                <div className="playlists-section">

                    {/* Sub-section 1: Danh Sách Của Bạn */}
                    {currentUser && userPlaylists.length > 0 && (
                        <div className="pl-subsection">
                            <div className="section-header">
                                <h2
                                    className="section-title title-with-icon"
                                    onClick={() => navigate('/playlist')}
                                >
                                    {/* <FiList className="title-icon" /> */}
                                    Danh Sách Phát Của Bạn
                                </h2>
                                <div className="slider-nav">
                                    <button
                                        className="slider-btn"
                                        onClick={() => playlistSliderRef.current?.scrollBy({ left: -800, behavior: 'smooth' })}
                                    >
                                        <FiChevronLeft className="slider-icon" />
                                    </button>
                                    <button
                                        className="slider-btn"
                                        onClick={() => playlistSliderRef.current?.scrollBy({ left: 800, behavior: 'smooth' })}
                                    >
                                        <FiChevronRight className="slider-icon" />
                                    </button>
                                </div>
                            </div>

                            <div className="song-slider-track" ref={playlistSliderRef}>
                                {userPlaylists.map(pl => (
                                    <div
                                        key={pl.id}
                                        className="playlist-home-card"
                                        onClick={() => navigate('/playlist', { state: { selectedPlaylistId: pl.id } })}
                                    >
                                        <PlaylistCoverCollage songs={pl.songs || []} />
                                        <div className="playlist-home-info">
                                            <h3 className="playlist-home-name">{pl.name}</h3>
                                            <p className="playlist-home-count">{pl.songs?.length || 0} bài hát</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* ===== SECTION: KHÁM PHÁ ALBUMS ===== */}
            <div className="section-header section-header--albums">
                <h2 className="section-title">Khám phá Albums</h2>
                <div className="slider-nav">
                    <button className="slider-btn" onClick={() => albumSliderRef.current?.scrollBy({ left: -800, behavior: 'smooth' })}>
                        <FiChevronLeft className="slider-icon" />
                    </button>
                    <button className="slider-btn" onClick={() => albumSliderRef.current?.scrollBy({ left: 800, behavior: 'smooth' })}>
                        <FiChevronRight className="slider-icon" />
                    </button>
                </div>
            </div>

            <div className="song-slider-track" ref={albumSliderRef}>
                {shuffledAlbums.map((album) => (
                    <div key={album.id} className="song-card" onClick={() => navigate(`/album/${album.id}`)}>
                        <div className="song-image-wrapper">
                            {album.coverUrl ? (
                                <img src={album.coverUrl} alt={album.title} className="song-image" />
                            ) : (
                                <div className="album-img-placeholder">
                                    <FiDisc className="album-placeholder-icon" />
                                </div>
                            )}
                        </div>
                        <div className="song-bottom-info">
                            <h3 className="song-title">{album.title}</h3>
                            <p className="song-artist">{album.artist?.name || 'Unknown Artist'}</p>
                            {album.releaseDate && (
                                <div className="song-meta-row">
                                    <span className="song-album">{new Date(album.releaseDate).getFullYear()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
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
