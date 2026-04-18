import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler'
import AdminRoute from './components/AdminRoute'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Playlist from './pages/Playlist'
import AdminSongs from './pages/AdminSongs'
import AdminUsers from './pages/AdminUsers'
import AlbumPage from './pages/AlbumPage'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />

        <Route path="playlist" element={<Playlist />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="album/:id" element={<AlbumPage />} />
        <Route path="profile" element={<Profile />} />

        <Route element={<AdminRoute />}>
          <Route path="admin/songs" element={<AdminSongs />} />
          <Route path="admin/users" element={<AdminUsers />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
