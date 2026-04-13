import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiHeart, FiChevronsLeft, FiChevronsRight, FiMusic, FiUsers, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


const Sidebar = ({ isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isAdmin } = useAuth();
    const { showToast } = useToast();


    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: FiHome, label: 'Trang Chủ' },
        { path: '/playlist', icon: FiList, label: 'Thư Viện' },
    ];

    const secondaryItems = [
        { path: '/favorites', icon: FiHeart, label: 'Bài Hát Yêu Thích' },
    ];

    const adminItems = [
        { path: '/admin/songs', icon: FiMusic, label: 'Quản Lý Nhạc' },
        { path: '/admin/users', icon: FiUsers, label: 'Quản Lý Người Dùng' },
    ];

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const active = item.path && isActive(item.path);

        const handleNavClick = () => {
            if (!item.path) return;

            const restrictedPaths = ['/playlist', '/favorites'];
            if (!currentUser && restrictedPaths.includes(item.path)) {
                showToast('Vui lòng đăng ký hoặc đăng nhập để sử dụng tính năng này!', 'error');
                return;
            }

            navigate(item.path);
        };

        return (
            <div
                key={item.label}
                className={`nav-item ${active ? 'nav-item-active' : ''}`}
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
                {navItems.map(renderNavItem)}
                {/* <div className="divider" /> */}
                {secondaryItems.map(renderNavItem)}

                {isAdmin && (
                    <>
                        <div className="divider" />
                        <div className="admin-section-label" title={isCollapsed ? 'Quản trị' : undefined}>
                            <FiShield className="admin-label-icon" />
                            <span className="nav-label">Quản Trị</span>
                        </div>
                        {adminItems.map(renderNavItem)}
                    </>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;