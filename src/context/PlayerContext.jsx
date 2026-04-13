import React, { createContext, useState, useContext } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [songQueue, setSongQueue] = useState([]);

    const playNext = () => {
        if (songQueue.length === 0 || !currentSong) return;
        const currentIndex = songQueue.findIndex(song => song.id === currentSong.id);

        if (currentIndex < songQueue.length - 1) {
            setCurrentSong(songQueue[currentIndex + 1]);
            setIsPlaying(true);
        }
        if (currentIndex === songQueue.length - 1) {
            setCurrentSong(songQueue[0])
            setIsPlaying(true)
        }
    };

    const playPrev = () => {
        if (songQueue.length === 0 || !currentSong) return;
        const currentIndex = songQueue.findIndex(song => song.id === currentSong.id);

        if (currentIndex > 0) {
            setCurrentSong(songQueue[currentIndex - 1]);
            setIsPlaying(true);
        }
        if (currentIndex === 0) {
            setCurrentSong(songQueue[songQueue.length - 1])
            setIsPlaying(true)
        }
    };


    return (
        <PlayerContext.Provider value={{ currentSong, setCurrentSong, isPlaying, setIsPlaying, songQueue, setSongQueue, playNext, playPrev }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);