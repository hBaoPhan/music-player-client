import React, { useState, useEffect } from 'react';
import { FiPlay } from 'react-icons/fi';
import songService from '../services/songService';
import '../styles/Home.css';
import { usePlayer } from '../context/PlayerContext';

const Home = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentSong, setCurrentSong, isPlaying, setIsPlaying } = usePlayer();

    const handlePlaySong = (song) => {
        setCurrentSong(song);
        setIsPlaying(true);
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
            <h2 className="section-title">Dành cho bạn</h2>

            <div className="song-grid">
                {songs.map((song) => (
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
                        </div>

                        <h3 className="song-title">{song.title}</h3>
                        <p className="song-artist">{song.artist?.name || "Unknown Artist"}</p>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;