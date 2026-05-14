import '../styles/Sidebar.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiHeart, FiClock, FiChevronsLeft, FiChevronsRight, FiMusic, FiUsers, FiGrid, FiPlusSquare, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import playlistService from '../services/playlistService';
import BaseModal from './BaseModal';


const Sidebar = ({ isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isAdmin } = useAuth();
    const { showToast } = useToast();

    const [playlists, setPlaylists] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchPlaylists();
        } else {
            setPlaylists([]);
        }
    }, [currentUser, location.pathname]);

    const fetchPlaylists = async () => {
        try {
            const data = await playlistService.getUserPlaylists(currentUser.id);
            setPlaylists(data || []);
        } catch (error) {
            console.error("Lỗi khi tải playlist:", error);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        setCreating(true);
        try {
            const newPlaylist = await playlistService.createPlaylist({
                name: newPlaylistName,
                userId: currentUser.id
            });
            setPlaylists([...playlists, newPlaylist]);
            showToast('Tạo danh sách phát thành công!', 'success');
            setNewPlaylistName('');
            setShowCreateModal(false);
            // Optionally navigate to the new playlist
            navigate('/playlist', { state: { selectedPlaylistId: newPlaylist.id } });
        } catch (error) {
            console.error("Lỗi khi tạo playlist:", error);
            showToast('Không thể tạo danh sách phát!', 'error');
        } finally {
            setCreating(false);
        }
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: FiHome, label: 'Trang Chủ' },
        { path: '/charts', icon: FiBarChart2, label: 'Bảng Xếp Hạng' },
    ];

    const secondaryItems = [
        { path: '/playlist', icon: FiList, label: 'Thư Viện' },
        { path: '/favorites', icon: FiHeart, label: 'Bài Hát Yêu Thích' },
        { path: '/history', icon: FiClock, label: 'Lịch Sử Nghe' },
    ];

    const adminItems = [
        { path: '/admin/dashboard', icon: FiGrid, label: 'Bảng Điều Khiển', isAdmin: true },
        { path: '/admin/songs', icon: FiMusic, label: 'Quản Lý Nhạc', isAdmin: true },
        { path: '/admin/users', icon: FiUsers, label: 'Quản Lý Người Dùng', isAdmin: true },
    ];

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const active = item.path && isActive(item.path);

        const handleNavClick = () => {
            if (!item.path) return;

            const restrictedPaths = ['/playlist', '/favorites', '/history'];
            if (!currentUser && restrictedPaths.includes(item.path)) {
                showToast('Vui lòng đăng ký hoặc đăng nhập để sử dụng tính năng này!', 'error');
                return;
            }

            navigate(item.path);
        };

        return (
            <div
                key={item.label}
                className={`nav-item ${active ? 'nav-item-active' : ''} ${item.isAdmin ? 'nav-item-admin' : ''}`}
                onClick={handleNavClick}
                title={isCollapsed ? item.label : undefined}
            >
                <Icon className="nav-item-icon" />
                <span className="nav-label">{item.label}</span>
            </div>
        );
    };

    return (
        <div className={`sidebar-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="sidebar-header">
                <span className="brand-text">SPOTIFOUR</span>
                <button
                    className="sidebar-toggle-btn"
                    onClick={onToggle}
                    title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                >
                    {isCollapsed
                        ? <FiChevronsRight className="text-xl" />
                        : <FiChevronsLeft className="text-xl" />
                    }
                </button>

            </div>

            <nav className="nav-menu">
                <div className="divider" />
                {navItems.map(renderNavItem)}
                <div className="divider" />
                {secondaryItems.map(renderNavItem)}

                {currentUser && (
                    <>
                        <div className="divider" />
                        <div
                            className="nav-item group"
                            onClick={() => setShowCreateModal(true)}
                            title={isCollapsed ? 'Tạo Playlist' : undefined}
                        >
                            <FiPlusSquare className="nav-item-icon text-gray-400 group-hover:text-white transition-colors" />
                            <span className="nav-label text-gray-400 group-hover:text-white transition-colors font-semibold">Tạo Playlist</span>
                        </div>

                        <div className={`mt-2 flex flex-col gap-1 overflow-y-auto max-h-48 scrollbar-hide ${isCollapsed ? 'items-center' : ''}`}>
                            {playlists.map(playlist => (
                                <div
                                    key={playlist.id}
                                    className="nav-item opacity-80 hover:opacity-100"
                                    onClick={() => navigate('/playlist', { state: { selectedPlaylistId: playlist.id } })}
                                    title={isCollapsed ? playlist.name : undefined}
                                >
                                    <FiMusic className="nav-item-icon text-sm min-w-4" />
                                    <span className="nav-label text-sm truncate">{playlist.name}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {isAdmin && (
                    <>
                        <div className="divider" />
                        {adminItems.map(renderNavItem)}
                    </>
                )}
            </nav>

            <BaseModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Tạo danh sách mới"
                overlayClassName="modal-overlay"
                contentClassName="modal-content"
                closeBtnClassName="admin-modal-close"
                titleClassName="modal-title"
            >
                <div className="modal-input-group">
                    <input
                        type="text"
                        placeholder="Nhập tên danh sách..."
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        className="new-playlist-input"
                        autoFocus
                    />
                    <div className="modal-actions">
                        <button
                            className="cancel-create-btn"
                            onClick={() => setShowCreateModal(false)}
                        >
                            Hủy
                        </button>
                        <button
                            className="confirm-create-btn"
                            onClick={handleCreatePlaylist}
                            disabled={creating || !newPlaylistName.trim()}
                        >
                            Tạo mới
                        </button>
                    </div>
                </div>
            </BaseModal>
        </div>
    );
};

export default Sidebar;