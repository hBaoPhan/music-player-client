import '../styles/Header.css';
import React, { useState, useEffect, useRef } from 'react';
import { FiLogOut, FiChevronLeft, FiChevronRight, FiSearch, FiX, FiUser, FiChevronDown, FiHeart, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import songService from '../services/songService';
import { useNavigate } from 'react-router-dom';
import UserProfileModal from './UserProfileModal';
import AddToPlaylistModal from './AddToPlaylistModal';
import { useToast } from '../context/ToastContext';
import userService from '../services/userService';

const Header = () => {
    const { currentUser, logout, getUser } = useAuth();
    const { setCurrentSong, setIsPlaying, setSongQueue, songQueue } = usePlayer() || {};


    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [allSongs, setAllSongs] = useState([]);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
    const { showToast } = useToast();
    const searchRef = useRef(null);
    const dropdownRef = useRef(null);

    const navigate = useNavigate();

    const GENRES = [
        'POP', 'ROCK', 'HIPHOP', 'RNB', 'EDM',
        'JAZZ', 'CLASSICAL', 'LOFI', 'KPOP', 'VPOP',
        'ACOUSTIC', 'INDIE', 'REMIX', 'OTHER',
    ];

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

    useEffect(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            const results = allSongs.filter(song => {
                const matchKeyword =
                    (song.title && song.title.toLowerCase().includes(keyword)) ||
                    (song.artist?.name && song.artist.name.toLowerCase().includes(keyword)) ||
                    (song.album?.title && song.album?.title.toLowerCase().includes(keyword));
                const matchGenre = !selectedGenre || song.genre === selectedGenre;
                return matchKeyword && matchGenre;
            });
            setSearchResults(results.slice(0, 5));
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, selectedGenre, allSongs]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearching(false);
            }
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
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

    const handleToggleFavorite = async (e, song) => {
        e.stopPropagation();
        if (!currentUser) {
            showToast('Vui lòng đăng nhập để sử dụng tính năng này!', 'error');
            return;
        }
        try {
            await userService.toggleFavorite(currentUser.id, song.id);
            if (getUser) await getUser();
        } catch (error) {
            console.error("Lỗi khi thêm vào yêu thích:", error);
        }
    };

    const isFavorite = (songId) => {
        return currentUser?.favoriteSongs?.some(fav => fav.id === songId);
    };

    return (
        <>
            <header className="header-container">
                <div className="header-left">
                    <button className="nav-btn" onClick={() => navigate(-1)}><FiChevronLeft className="text-xl" /></button>
                    <button className="nav-btn" onClick={() => navigate(1)}><FiChevronRight className="text-xl" /></button>
                </div>

                <div className="header-search-container" ref={searchRef}>
                    <div className="search-input-wrapper group flex items-center gap-2">
                        <div className="relative flex-1 flex items-center">
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
                        <div className="relative flex items-center">
                            <select
                                className="search-input"
                                style={{
                                    width: '110px',
                                    paddingLeft: '1rem',
                                    paddingRight: '2.5rem',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    backgroundImage: 'none'
                                }}
                                value={selectedGenre}
                                onChange={(e) => {
                                    setSelectedGenre(e.target.value);
                                    setIsSearching(true);
                                }}
                            >
                                <option value="">Thể loại</option>
                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <FiChevronDown className="absolute right-4 text-white pointer-events-none text-lg" />
                        </div>
                    </div>

                    {isSearching && searchTerm.trim() !== '' && (
                        <div className="search-dropdown-menu">
                            {searchResults.length > 0 ? (
                                <ul className="search-result-list">
                                    {searchResults.map(song => {
                                        const favorited = isFavorite(song.id);
                                        return (
                                            <li key={song.id} className="search-result-item group" onClick={() => handlePlaySong(song)}>
                                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                    <div className="result-img-wrapper">
                                                        {song.album?.coverUrl ? (
                                                            <img src={song.album.coverUrl} alt={song.title} />
                                                        ) : (
                                                            <div className="fallback-img" />
                                                        )}
                                                    </div>
                                                    <div className="result-info">
                                                        <p className="result-title">{song.title}</p>
                                                        <p className="result-artist">{song.artist?.name || 'Unknown Artist'}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="result-album">{song.album ? (song.album.type === "SINGLE" ? "Single" : `${song.album.type}: ${song.album.title}`) : "Unknown Album"}</span>
                                                            {song.genre && <span className="result-genre">{song.genre}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-1.5 text-gray-400 hover:text-white transition-colors focus:outline-none"
                                                        onClick={(e) => handleToggleFavorite(e, song)}
                                                        title={favorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                                                    >
                                                        <FiHeart className={`text-lg ${favorited ? 'fill-green-500 text-green-500 hover:text-green-400 hover:fill-green-400' : ''}`} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-gray-400 hover:text-white transition-colors focus:outline-none"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (!currentUser) {
                                                                showToast('Vui lòng đăng nhập để sử dụng tính năng này!', 'error');
                                                                return;
                                                            }
                                                            setSelectedSongForPlaylist(song);
                                                        }}
                                                        title="Thêm vào danh sách phát"
                                                    >
                                                        <FiPlus className="text-xl" />
                                                    </button>
                                                </div>
                                            </li>
                                        )
                                    })}
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
                        <div className="user-menu-wrapper" ref={dropdownRef}>
                            <button
                                className="user-avatar-btn"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className="avatar-fallback">{getInitial(currentUser.username)}</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <div className="dropdown-user-info">
                                        <div className="dropdown-user-header">
                                            <div className="dropdown-avatar-small">
                                                <span>{getInitial(currentUser.username)}</span>
                                            </div>
                                            <div className="dropdown-user-details">
                                                <span className="dropdown-user-name">{currentUser.username}</span>
                                                <span className="dropdown-user-email">{currentUser.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile / Change Password */}
                                    <button
                                        className="dropdown-item"
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setShowProfileModal(true);
                                        }}
                                    >
                                        <FiUser className="text-lg" />
                                        <span>Tài khoản của tôi</span>
                                    </button>

                                    {/* Logout */}
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

            {showProfileModal && (
                <UserProfileModal onClose={() => setShowProfileModal(false)} />
            )}

            {selectedSongForPlaylist && (
                <AddToPlaylistModal
                    song={selectedSongForPlaylist}
                    onClose={() => setSelectedSongForPlaylist(null)}
                />
            )}
        </>
    );
};

export default Header;
