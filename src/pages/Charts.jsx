import '../styles/Charts.css';
import React, { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiHeart, FiDisc, FiPlay, FiUser, FiHeadphones } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import dashboardService from '../services/dashboardService';

const Charts = () => {
    const navigate = useNavigate();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();

    const [trending, setTrending] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [trendingArtists, setTrendingArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('trending');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [trendingData, favoritesData, artistsData] = await Promise.all([
                dashboardService.getTrending(),
                dashboardService.getTopFavorites(),
                dashboardService.getTrendingArtists(5),
            ]);
            setTrending(trendingData || []);
            setFavorites(favoritesData || []);
            setTrendingArtists(artistsData || []);
        } catch (error) {
            console.error('Lỗi khi tải bảng xếp hạng:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePlaySong = (song, list) => {
        const queue = list.map(s => ({
            id: s.songId,
            title: s.title,
            artist: { name: s.artistName },
            album: { coverUrl: s.coverUrl },
            audioUrl: s.audioUrl,
        }));
        const current = {
            id: song.songId,
            title: song.title,
            artist: { name: song.artistName },
            album: { coverUrl: song.coverUrl },
            audioUrl: song.audioUrl,
        };
        setCurrentSong(current);
        setIsPlaying(true);
        setSongQueue(queue);
    };


    const activeList = activeTab === 'trending' ? trending : favorites;

    return (
        <div className="charts-container">
            <div className="charts-hero">
                <div className="charts-hero-icon">
                    <FiTrendingUp />
                </div>
                <div>
                    <h1 className="charts-hero-title">Bảng Xếp Hạng</h1>
                    <p className="charts-hero-subtitle">Top 10 bài hát thịnh hành nhất tuần này</p>
                </div>
            </div>

            <div className="charts-tabs">
                <button
                    id="tab-trending"
                    className={`charts-tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trending')}
                >
                    <FiTrendingUp className="inline mr-2" />
                    Top Trending
                </button>
                <button
                    id="tab-favorites"
                    className={`charts-tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                    onClick={() => setActiveTab('favorites')}
                >
                    <FiHeart className="inline mr-2" />
                    Top Yêu Thích
                </button>
            </div>

            <div className="charts-body">
                <div className="charts-song-list">
                    {loading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="charts-song-skeleton" />
                        ))
                    ) : activeList.length === 0 ? (
                        <p className="charts-empty">Chưa có dữ liệu.</p>
                    ) : (
                        activeList.map((song, index) => (
                            <div
                                key={song.songId}
                                id={`song-row-${song.songId}`}
                                className="charts-song-row group"
                                onClick={() => handlePlaySong(song, activeList)}
                            >
                                <div className={`charts-rank ${index < 3 ? 'charts-rank-top' : ''}`}>
                                    {index < 3 ? (
                                        <span className={`charts-rank-badge rank-${index + 1}`}>{index + 1}</span>
                                    ) : (
                                        <span className="charts-rank-num">{index + 1}</span>
                                    )}
                                </div>

                                <div className="charts-song-cover-wrapper">
                                    {song.coverUrl ? (
                                        <img src={song.coverUrl} alt={song.title} className="charts-song-cover" />
                                    ) : (
                                        <div className="charts-song-cover-placeholder">
                                            <FiDisc className="text-gray-500 text-2xl" />
                                        </div>
                                    )}
                                    <div className="charts-song-play-overlay">
                                        <FiPlay className="text-black text-lg" />
                                    </div>
                                </div>

                                <div className="charts-song-info">
                                    <p className="charts-song-title">{song.title}</p>
                                    <p className="charts-song-artist">{song.artistName}</p>
                                </div>

                                <div className="charts-play-count">
                                    {activeTab === 'trending' ? (
                                        <>
                                            <FiTrendingUp className="text-emerald-400" />
                                            <span>{song.playCount.toLocaleString()} lượt nghe</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiHeart className="text-pink-400" />
                                            <span>{song.playCount.toLocaleString()} yêu thích</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Trending Artists Panel */}
                <div className="charts-artist-panel">
                    <h2 className="charts-artist-panel-title">
                        <FiUser className="inline mr-2" />
                        Nghệ Sĩ Nổi Bật
                    </h2>
                    <p className="charts-artist-panel-sub">Top 5 nghệ sĩ được nghe nhiều nhất tuần này</p>

                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="charts-artist-skeleton" />
                        ))
                    ) : trendingArtists.length === 0 ? (
                        <p className="charts-empty">Chưa có dữ liệu.</p>
                    ) : (
                        <div className="charts-artist-list">
                            {trendingArtists.map((artist, index) => (
                                <div
                                    key={artist.id}
                                    className="charts-artist-row group"
                                    onClick={() => navigate(`/artist/${artist.id}`)}
                                >
                                    <div className="charts-artist-rank-wrap">
                                        {index < 3 ? (
                                            <span className={`charts-rank-badge rank-${index + 1}`}>{index + 1}</span>
                                        ) : (
                                            <span className="charts-rank-num">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="charts-artist-avatar-wrap">
                                        {artist.avatarUrl ? (
                                            <img src={artist.avatarUrl} alt={artist.name} className="charts-artist-avatar" />
                                        ) : (
                                            <div className="charts-artist-avatar-placeholder">
                                                <FiUser className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="charts-artist-info">
                                        <p className="charts-artist-name">{artist.name}</p>
                                        <p className="charts-artist-plays">
                                            <FiHeadphones className="inline mr-1" />
                                            {artist.playCount.toLocaleString()} lượt nghe
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Charts;
