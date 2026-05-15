import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import songService from '../services/songService';

const SongsContext = createContext();

export const SongsProvider = ({ children }) => {
    const [allSongs, setAllSongs] = useState([]);
    const [songsLoading, setSongsLoading] = useState(true);

    const refreshSongs = useCallback(async () => {
        try {
            const data = await songService.getAllSongs();
            setAllSongs(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách bài hát:', error);
        } finally {
            setSongsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSongs();

        const interval = setInterval(refreshSongs, 5 * 60 * 1000); // auto-refetch mỗi 5 phút
        return () => clearInterval(interval);
    }, [refreshSongs]);

    return (
        <SongsContext.Provider value={{ allSongs, songsLoading, refreshSongs }}>
            {children}
        </SongsContext.Provider>
    );
};

export const useSongs = () => useContext(SongsContext);
