import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Playlist from './pages/Playlist'

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
      </Route>
    </Routes>
  )
}

export default App
