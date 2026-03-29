import React, { useState } from 'react';
import { FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <button className="nav-btn"><FiChevronLeft className="text-xl" /></button>
                <button className="nav-btn"><FiChevronRight className="text-xl" /></button>
            </div>

            <div className="header-right">
                {currentUser && (
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
                                    <p className="text-sm font-bold text-white truncate">{currentUser.username}</p>
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
                )}
            </div>
        </header>
    );
};

export default Header;