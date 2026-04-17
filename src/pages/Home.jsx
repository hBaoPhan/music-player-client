import '../styles/Home.css';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FiPlay, FiHeart, FiPlus, FiChevronLeft, FiChevronRight, FiDisc } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import SongCard from '../components/SongCard';
import songService from '../services/songService';
import userService from '../services/userService';
import albumService from '../services/albumService';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const shuffleArray = (items = []) => {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
};

const Home = () => {
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);
    const albumSliderRef = useRef(null);
    const navigate = useNavigate();
    const { currentUser, getUser } = useAuth();
    const { showToast } = useToast();
    const { currentSong, setCurrentSong, isPlaying, setIsPlaying, setSongQueue } = usePlayer();
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
    }, [])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [songsData, albumsData] = await Promise.all([
                    songService.getAllSongs(),
                    albumService.getAllAlbums()
                ]);
                setSongs(songsData);

                const albumsDataFiltered = albumsData.filter((album) => {
                    let count = 0;
                    songsData.forEach((song) => {
                        if (album.id === song.album?.id) {
                            count += 1;
                        }
                    });
                    return count >= 2;
                });

                setAlbums(albumsDataFiltered);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang chủ:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading-text">Đang tải danh sách bài hát...</div>;
    }

    return (
        <div className="home-container">
            <div className="section-header">
                <h2 className="section-title">Dành cho {currentUser?.username}</h2>
                <div className="slider-nav">
                    <button className="slider-btn" onClick={() => sliderRef.current?.scrollBy({ left: -800, behavior: 'smooth' })}>
                        <FiChevronLeft className="text-xl" />
                    </button>
                    <button className="slider-btn" onClick={() => sliderRef.current?.scrollBy({ left: 800, behavior: 'smooth' })}>
                        <FiChevronRight className="text-xl" />
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

            <div className="section-header mt-8">
                <h2 className="section-title">Khám phá Albums</h2>
                <div className="slider-nav">
                    <button className="slider-btn" onClick={() => albumSliderRef.current?.scrollBy({ left: -800, behavior: 'smooth' })}>
                        <FiChevronLeft className="text-xl" />
                    </button>
                    <button className="slider-btn" onClick={() => albumSliderRef.current?.scrollBy({ left: 800, behavior: 'smooth' })}>
                        <FiChevronRight className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="song-slider-track" ref={albumSliderRef}>
                {shuffledAlbums.map((album) => (
                    <div key={album.id} className="song-card group" onClick={() => navigate(`/album/${album.id}`)}>
                        <div className="song-image-wrapper">
                            {album.coverUrl ? (
                                <img
                                    src={album.coverUrl}
                                    alt={album.title}
                                    className="song-image"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                                    <FiDisc className="text-4xl text-white/50" />
                                </div>
                            )}
                        </div>

                        <div className="song-bottom-info mt-3">
                            <h3 className="song-title">{album.title}</h3>
                            <p className="song-artist">{album.artist?.name || "Unknown Artist"}</p>
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
