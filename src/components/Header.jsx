import React, { useState, useEffect, useRef } from 'react';
import { FiLogOut, FiChevronLeft, FiChevronRight, FiSearch, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import songService from '../services/songService';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const { setCurrentSong, setIsPlaying, setSongQueue, songQueue } = usePlayer() || {};
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [allSongs, setAllSongs] = useState([]);
    const searchRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllSongs = async () => {
            try {
                const response = await songService.getAllSongs();
                setAllSongs(response);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu tìm kiếm", error);
            }
        };
        fetchAllSongs();
    }, []);

    // load lại khi songs hoặc search khác
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            const keyword = searchTerm.toLowerCase();
            const results = allSongs.filter(song =>
                (song.title && song.title.toLowerCase().includes(keyword)) ||
                (song.artist.name && song.artist.name.toLowerCase().includes(keyword)) ||
                (song.album.title && song.album.title.toLowerCase().includes(keyword))
            );
            setSearchResults(results.slice(0, 5));
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, allSongs]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePlaySong = (song) => {
        if (setCurrentSong && setIsPlaying) {
            if (setSongQueue && songQueue && !songQueue.find(s => s.id === song.id)) {
                setSongQueue([...songQueue, song]);
            }
            setCurrentSong(song);
            setIsPlaying(true);
            setIsSearching(false);
            setSearchTerm('');
        }
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <button className="nav-btn" onClick={() => navigate(-1)}><FiChevronLeft className="text-xl" /></button>
                <button className="nav-btn" onClick={() => navigate(1)}><FiChevronRight className="text-xl" /></button>
            </div>

            <div className="header-search-container" ref={searchRef}>
                <div className="search-input-wrapper group">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Bạn muốn nghe gì?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearching(true)}
                    />
                    {searchTerm && (
                        <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
                            <FiX />
                        </button>
                    )}
                </div>

                {isSearching && searchTerm.trim() !== '' && (
                    <div className="search-dropdown-menu">
                        {searchResults.length > 0 ? (
                            <ul className="search-result-list">
                                {searchResults.map(song => (
                                    <li key={song.id} className="search-result-item" onClick={() => handlePlaySong(song)}>
                                        <div className="result-img-wrapper">
                                            {song.album.coverUrl ? (
                                                <img src={song.album.coverUrl} alt={song.title} />
                                            ) : (
                                                <div className="fallback-img" />
                                            )}
                                        </div>
                                        <div className="result-info">
                                            <p className="result-title">{song.title}</p>
                                            <p className="result-artist">{song.artist.name || 'Unknown Artist'}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="search-no-result">
                                Không tìm thấy kết quả cho "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}
            </div>



            <div className="header-right">
                {currentUser ? (
                    <div className="user-menu-wrapper">
                        <button
                            className="user-avatar-btn"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="avatar-fallback">{getInitial(currentUser.username)}</span>
                        </button>

                        {isDropdownOpen && (
                            <div className="user-dropdown-menu">
                                <div className="px-4 py-2 mb-1 border-b border-gray-700">
                                    <p className="text-sm font-bold text-white truncate">Người dùng: {currentUser.username}</p>
                                </div>
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        logout();
                                    }}
                                >
                                    <FiLogOut className="text-lg" />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="auth-buttons-wrapper">
                        <button className="register-btn" onClick={() => navigate('/register')}>Đăng ký</button>
                        <button className="login-btn" onClick={() => navigate('/login')}>Đăng nhập</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;