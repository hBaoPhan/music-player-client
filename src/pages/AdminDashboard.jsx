import '../styles/AdminDashboard.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FiUsers, FiMusic, FiMic, FiHeadphones, FiActivity,
    FiTrendingUp, FiHeart, FiGrid, FiRefreshCw, FiZap
} from 'react-icons/fi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import dashboardService from '../services/dashboardService';
import { useToast } from '../context/ToastContext';

// ─── Colour palette for PieChart ──────────────────────────────────────────────
const GENRE_COLORS = [
    '#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fb923c',
    '#facc15', '#60a5fa', '#e879f9', '#4ade80', '#f87171',
    '#38bdf8', '#c084fc', '#86efac', '#fca5a5',
];

// ─── Number formatter ─────────────────────────────────────────────────────────
const fmt = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n || 0);
};

// ─── Overview Card ────────────────────────────────────────────────────────────
const OverviewCard = ({ icon: Icon, label, value, sub, color, id, isLive }) => (
    <div className="dash-card" id={id}>
        <div className={`dash-card-icon-wrap dash-card-icon-${color}`}>
            <Icon />
            {isLive && <span className="dash-card-live-dot" />}
        </div>
        <div className="dash-card-body">
            <p className="dash-card-label">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="dash-card-value">{fmt(value)}</p>
                {isLive && <span className="text-[10px] font-bold text-green-400 animate-pulse">LIVE</span>}
            </div>
            {sub && <p className="dash-card-sub">{sub}</p>}
        </div>
        <div className={`dash-card-glow dash-card-glow-${color}`} />
    </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="dash-section-header">
        <Icon className="dash-section-icon" />
        <div>
            <h2 className="dash-section-title">{title}</h2>
            {subtitle && <p className="dash-section-subtitle">{subtitle}</p>}
        </div>
    </div>
);

// ─── Custom Tooltip for Line/Bar Charts ───────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="dash-tooltip">
            <p className="dash-tooltip-label">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }} className="dash-tooltip-val">
                    {entry.name}: <strong>{fmt(entry.value)}</strong>
                </p>
            ))}
        </div>
    );
};

// ─── Custom Label inside PieChart ─────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.04) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { showToast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const stompClientRef = useRef(null);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await dashboardService.getStats();
            setData(res);
            setOnlineCount(res.usersOnline);
        } catch {
            showToast('Không thể tải dữ liệu Dashboard!', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();

        // WebSocket Setup
        const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                client.subscribe('/topic/online-users', (message) => {
                    setOnlineCount(parseInt(message.body));
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [fetchData]);

    if (loading) {
        return (
            <div className="dash-loading-wrap">
                <div className="dash-spinner" />
                <p>Đang tải dữ liệu Dashboard...</p>
            </div>
        );
    }

    if (!data) return null;

    const {
        totalUsers, newUsersToday, totalSongs, totalArtists, totalStreams,
        userGrowthLast7Days, streamsLast7Days,
        top10TrendingSongs, top10FavoriteSongs, genreDistribution,
    } = data;

    return (
        <div className="dash-page">

            {/* ── Page Header ─── */}
            <div className="dash-page-header">
                <div className="dash-page-title-wrap">
                    <FiGrid className="dash-page-title-icon" />
                    <div>
                        <h1 className="dash-page-title">Tổng Quan Hệ Thống</h1>
                        <p className="dash-page-subtitle">Dữ liệu thực tế · cập nhật mỗi lần tải trang</p>
                    </div>
                </div>
                <button
                    id="btn-refresh-dashboard"
                    className={`dash-refresh-btn ${refreshing ? 'dash-refresh-btn--spin' : ''}`}
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                >
                    <FiRefreshCw />
                    {refreshing ? 'Đang cập nhật...' : 'Làm mới'}
                </button>
            </div>

            {/* ══════════════════════════════════════════════
                SECTION 1 – Overview Cards 
            ══════════════════════════════════════════════ */}
            <section className="dash-section">
                <div className="dash-overview-grid">
                    <OverviewCard
                        id="card-total-users"
                        icon={FiUsers}
                        label="Tổng Người Dùng"
                        value={totalUsers}
                        sub={newUsersToday > 0 ? `+${newUsersToday} hôm nay` : 'Không có mới hôm nay'}
                        color="blue"
                    />
                    <OverviewCard
                        id="card-online-users"
                        icon={FiZap}
                        label="Đang Trực Tuyến"
                        value={onlineCount}
                        color="green"
                        isLive={true}
                    />
                    <OverviewCard
                        id="card-total-content"
                        icon={FiMusic}
                        label="Kho Nội Dung"
                        value={totalSongs}
                        sub={`${totalArtists} nghệ sĩ`}
                        color="purple"
                    />
                    <OverviewCard
                        id="card-total-streams"
                        icon={FiHeadphones}
                        label="Tổng Lượt Nghe"
                        value={totalStreams}
                        color="amber"
                    />
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                SECTION 2 – Growth Charts
            ══════════════════════════════════════════════ */}
            <section className="dash-section">
                <SectionHeader
                    icon={FiActivity}
                    title="Biểu Đồ Tăng Trưởng"
                    subtitle="7 ngày gần nhất"
                />
                <div className="dash-charts-grid">

                    {/* User Growth – Line Chart */}
                    <div className="dash-chart-card" id="chart-user-growth">
                        <h3 className="dash-chart-title">
                            <FiUsers /> Đăng Ký Mới
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={userGrowthLast7Days} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }}
                                    tickFormatter={d => d.slice(5)} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line
                                    type="monotone" dataKey="count" name="Người dùng mới"
                                    stroke="#60a5fa" strokeWidth={2.5}
                                    dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Streams – Bar Chart */}
                    <div className="dash-chart-card" id="chart-streams">
                        <h3 className="dash-chart-title">
                            <FiHeadphones /> Lượt Nghe Theo Ngày
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={streamsLast7Days} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }}
                                    tickFormatter={d => d.slice(5)} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="count" name="Lượt nghe" fill="url(#streamGrad)"
                                    radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                SECTION 3 – Content Analytics
            ══════════════════════════════════════════════ */}
            <section className="dash-section">
                <SectionHeader
                    icon={FiTrendingUp}
                    title="Phân Tích Nội Dung"
                    subtitle="Top bài hát & phân bổ thể loại"
                />
                <div className="dash-analytics-grid">

                    {/* Top 10 Trending */}
                    <div className="dash-analytics-card" id="card-top-trending">
                        <h3 className="dash-analytics-title">
                            <FiTrendingUp className="dash-analytics-icon--trending" />
                            Top 10 Trending (7 ngày)
                        </h3>
                        <ol className="dash-rank-list">
                            {top10TrendingSongs.length === 0 ? (
                                <li className="dash-rank-empty">Chưa có dữ liệu lượt nghe</li>
                            ) : top10TrendingSongs.map((song, i) => (
                                <li key={song.songId} className="dash-rank-item">
                                    <span className={`dash-rank-num ${i < 3 ? 'dash-rank-num--top' : ''}`}>
                                        {i + 1}
                                    </span>
                                    <div className="dash-rank-thumb">
                                        {song.coverUrl
                                            ? <img src={song.coverUrl} alt={song.title} />
                                            : <FiMusic className="dash-rank-thumb-fallback" />
                                        }
                                    </div>
                                    <div className="dash-rank-info">
                                        <p className="dash-rank-title">{song.title}</p>
                                        <p className="dash-rank-artist">{song.artistName}</p>
                                    </div>
                                    <span className="dash-rank-count">{fmt(song.playCount)} plays</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Top 10 Favorites */}
                    <div className="dash-analytics-card" id="card-top-favorites">
                        <h3 className="dash-analytics-title">
                            <FiHeart className="dash-analytics-icon--heart" />
                            Top 10 Yêu Thích
                        </h3>
                        <ol className="dash-rank-list">
                            {top10FavoriteSongs.length === 0 ? (
                                <li className="dash-rank-empty">Chưa có lượt yêu thích</li>
                            ) : top10FavoriteSongs.map((song, i) => (
                                <li key={song.songId} className="dash-rank-item">
                                    <span className={`dash-rank-num ${i < 3 ? 'dash-rank-num--top' : ''}`}>
                                        {i + 1}
                                    </span>
                                    <div className="dash-rank-thumb">
                                        {song.coverUrl
                                            ? <img src={song.coverUrl} alt={song.title} />
                                            : <FiMusic className="dash-rank-thumb-fallback" />
                                        }
                                    </div>
                                    <div className="dash-rank-info">
                                        <p className="dash-rank-title">{song.title}</p>
                                        <p className="dash-rank-artist">{song.artistName}</p>
                                    </div>
                                    <span className="dash-rank-count dash-rank-count--heart">
                                        {fmt(song.playCount)} ❤
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Genre Distribution – Pie Chart */}
                    <div className="dash-analytics-card" id="card-genre-pie">
                        <h3 className="dash-analytics-title">
                            <FiGrid className="dash-analytics-icon--genre" />
                            Phân Bổ Thể Loại Nhạc
                        </h3>
                        {genreDistribution.length === 0 ? (
                            <p className="dash-rank-empty">Chưa có dữ liệu thể loại</p>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={genreDistribution}
                                            dataKey="count"
                                            nameKey="genre"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={85}
                                            labelLine={false}
                                            label={PieLabel}
                                        >
                                            {genreDistribution.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={GENRE_COLORS[index % GENRE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name) => [fmt(value) + ' bài', name]}
                                            contentStyle={{
                                                background: '#111827',
                                                border: '1px solid #374151',
                                                borderRadius: '12px',
                                                color: '#f9fafb',
                                                fontSize: 12,
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="dash-pie-legend">
                                    {genreDistribution.map((item, i) => (
                                        <div key={item.genre} className="dash-pie-legend-item">
                                            <span
                                                className="dash-pie-legend-dot"
                                                style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }}
                                            />
                                            <span className="dash-pie-legend-label">{item.genre}</span>
                                            <span className="dash-pie-legend-count">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
};

export default AdminDashboard;
