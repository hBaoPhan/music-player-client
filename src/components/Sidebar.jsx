import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiList, FiHeart, FiMusic } from 'react-icons/fi';
import '../styles/Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar-container">
            <div className="logo-section">
                <h1 className="logo-text cursor-pointer" onClick={() => navigate('/')}>
                    <FiMusic className="text-3xl" />
                    Spotifour
                </h1>
            </div>

            {/* menu */}
            <nav className="nav-menu">
                <div
                    className={`nav-item ${isActive('/') ? 'nav-item-active' : ''}`}
                    onClick={() => navigate('/')}
                >
                    <FiHome className="text-xl" />
                    Trang Chủ
                </div>

                <div className="nav-item">
                    <FiSearch className="text-xl" />
                    Tìm Kiếm
                </div>

                <div className="nav-item">
                    <FiList className="text-xl" />
                    Thư Viện
                </div>

                <div className="divider"></div>

                <div
                    className={`nav-item ${isActive('/favorites') ? 'nav-item-active' : ''}`}
                    onClick={() => navigate('/favorites')}
                >
                    <FiHeart className="text-xl" />
                    Bài Hát Yêu Thích
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;