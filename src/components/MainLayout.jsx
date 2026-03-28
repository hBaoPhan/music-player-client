import React from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/MainLayout.css';

const MainLayout = () => {
    return (
        <div className="layout-container">

            <aside className="sidebar">
                <div className="sidebar-content">
                    <h1 className="app-logo">Music App</h1>
                </div>
            </aside>

            <main className="main-content">
                <div className="page-wrapper">
                    <Outlet />
                </div>
            </main>

            <div className="player-bar">
                <div className="player-content">
                    <p className="player-text">Thanh phát nhạc sẽ nằm ở đây...</p>
                    {/*Play, Pause, Next*/}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;