import '../styles/Playlist.css';
import React, { useState } from 'react';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import SongCard from '../components/SongCard';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

const Favorites = () => {
    const { currentUser } = useAuth();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

    const handlePlaySong = (song, songsQueue) => {
        setCurrentSong(song);
        setIsPlaying(true);
        setSongQueue(songsQueue);
    };

    const favoriteSongs = currentUser?.favoriteSongs || [];

    if (!currentUser) {
        return <div className="loading-text">Vui lòng đăng nhập để xem bài hát yêu thích.</div>;
    }

    return (
        <div className="home-container">
            <h2 className="section-title">Bài Hát Yêu Thích Của Bạn</h2>

            {favoriteSongs.length === 0 ? (
                <p className="text-gray-400 text-lg">Bạn chưa có bài hát yêu thích nào. Hãy thả tim một bài hát để xem tại đây.</p>
            ) : (
                <div className="song-grid">
                    {favoriteSongs.map((song) => (
                        <SongCard 
                            key={song.id} 
                            song={song} 
                            onClick={() => handlePlaySong(song, favoriteSongs)}
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

export default Favorites;
