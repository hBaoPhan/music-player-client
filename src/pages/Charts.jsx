import '../styles/Charts.css';
import React, { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiHeart, FiDisc, FiMusic, FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import dashboardService from '../services/dashboardService';

const GENRE_COLORS = [
    '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

const Charts = () => {
    const navigate = useNavigate();
    const { setCurrentSong, setIsPlaying, setSongQueue } = usePlayer();

    const [trending, setTrending] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('trending');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [trendingData, favoritesData, genresData] = await Promise.all([
                dashboardService.getTrending(),
                dashboardService.getTopFavorites(),
                dashboardService.getGenreDistribution(),
            ]);
            setTrending(trendingData || []);
            setFavorites(favoritesData || []);
            setGenres(genresData || []);
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
        }));
        const current = { id: song.songId, title: song.title, artist: { name: song.artistName }, album: { coverUrl: song.coverUrl } };
        setCurrentSong(current);
        setIsPlaying(true);
        setSongQueue(queue);
    };

    const totalGenreCount = genres.reduce((sum, g) => sum + g.count, 0);

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
                {/* Song List */}
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

                {/* Genre Distribution */}
                <div className="charts-genre-panel">
                    <h2 className="charts-genre-title">
                        <FiMusic className="inline mr-2" />
                        Phân Bố Thể Loại
                    </h2>
                    {loading ? (
                        <div className="charts-song-skeleton h-40" />
                    ) : (
                        <div className="charts-genre-list">
                            {genres.map((g, i) => {
                                const pct = totalGenreCount > 0
                                    ? ((g.count / totalGenreCount) * 100).toFixed(1)
                                    : 0;
                                const color = GENRE_COLORS[i % GENRE_COLORS.length];
                                return (
                                    <div key={g.genre} className="charts-genre-item">
                                        <div className="charts-genre-label">
                                            <span className="charts-genre-dot" style={{ background: color }} />
                                            <span className="charts-genre-name">{g.genre}</span>
                                            <span className="charts-genre-pct">{pct}%</span>
                                        </div>
                                        <div className="charts-genre-bar-bg">
                                            <div
                                                className="charts-genre-bar-fill"
                                                style={{ width: `${pct}%`, background: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Charts;
