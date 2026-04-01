import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/MainLayout.css';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import Header from './Header';

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleToggle = () => {
        setIsCollapsed((prev) => !prev);
    };

    return (
        <div className="layout-container">
            <Header />

            <aside className={`sidebar ${isCollapsed ? 'sidebar-narrow' : ''}`}>
                <div className="sidebar-content">
                    <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
                </div>
            </aside>

            <main className="main-content">
                <div className="page-wrapper">
                    <Outlet />
                </div>
            </main>

            <div className="player-bar">
                <div className="player-content">
                    <PlayerBar />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;