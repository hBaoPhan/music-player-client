import { useState } from 'react'
import Login from './components/Login'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout'
import Home from './pages/Home'
import Favorites from './pages/Favorites'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />

        {/* <Route path="playlist" element={<Playlist />} /> */}
        <Route path="favorites" element={<Favorites />} />
      </Route>
    </Routes>
  )
}

export default App
