import React from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/MainLayout.css';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import Header from './Header';

const MainLayout = () => {
    return (
        <div className="layout-container">

            <aside className="sidebar">
                <div className="sidebar-content">
                    <Sidebar></Sidebar>
                </div>
            </aside>

            <main className="main-content">
                <Header></Header>
                <div className="page-wrapper">
                    <Outlet />
                </div>
            </main>

            <div className="player-bar">
                <div className="player-content">
                    <PlayerBar></PlayerBar>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;