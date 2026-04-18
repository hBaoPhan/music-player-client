import '../styles/Playlist.css';
import React, { useState, useEffect } from 'react';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import SongCard from '../components/SongCard';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import userService from '../services/userService';

const History = () => {
    const { currentUser } = useAuth();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();
    const [historyGroups, setHistoryGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (currentUser) {
                try {
                    setLoading(true);
                    const response = await userService.getHistorySong(currentUser.id);
                    
                    const groups = {};
                    response.forEach(item => {
                        const dateObj = new Date(item.listenedAt);
                        dateObj.setHours(0, 0, 0, 0);
                        const dateKey = dateObj.toISOString();
                        
                        if (!groups[dateKey]) {
                            groups[dateKey] = [];
                        }
                        groups[dateKey].push(item);
                    });
                    
                    const sortedGroups = {};
                    Object.keys(groups).sort((a,b) => new Date(b) - new Date(a)).forEach(key => {
                        sortedGroups[key] = groups[key];
                    });
                    
                    setHistoryGroups(sortedGroups);
                } catch (error) {
                    console.error("Lỗi khi tải lịch sử nghe nhạc:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser]);

    const handlePlaySong = (song, groupItems) => {
        const songsQueue = groupItems.map(item => item.song);
        setCurrentSong(song);
        setIsPlaying(true);
        setSongQueue(songsQueue);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.getTime() === today.getTime()) {
            return "Hôm nay";
        } else if (date.getTime() === yesterday.getTime()) {
            return "Hôm qua";
        } else {
            return date.toLocaleDateString('vi-VN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
    };

    if (!currentUser) {
        return <div className="loading-text">Vui lòng đăng nhập để xem lịch sử nghe nhạc.</div>;
    }

    if (loading) {
        return <div className="loading-text">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="home-container">
            <h2 className="section-title">Lịch Sử Nghe Gần Đây</h2>

            {Object.keys(historyGroups).length === 0 ? (
                <p className="text-gray-400 text-lg">Bạn chưa có lịch sử nghe nhạc nào.</p>
            ) : (
                Object.entries(historyGroups).map(([dateKey, items]) => (
                    <div key={dateKey} className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">{formatDate(dateKey)}</h3>
                        <div className="song-grid">
                            {items.map((item) => (
                                <SongCard 
                                    key={item.id} 
                                    song={item.song} 
                                    onClick={() => handlePlaySong(item.song, items)}
                                    onAddToPlaylist={setSelectedSongForPlaylist}
                                />
                            ))}
                        </div>
                    </div>
                ))
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

export default History;
