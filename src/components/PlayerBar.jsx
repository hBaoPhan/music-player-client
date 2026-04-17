import '../styles/PlayerBar.css';
import React, { useRef, useEffect, useState } from 'react';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiHeart, FiShuffle } from 'react-icons/fi';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import userService from '../services/userService';

const PlayerBar = () => {
    const { currentSong, isPlaying, setIsPlaying, playNext, playPrev, isShuffle, setIsShuffle } = usePlayer();
    const { currentUser, getUser } = useAuth();
    const { showToast } = useToast();
    const audioRef = useRef(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const progressPercent = duration && duration > 0 ? (currentTime / duration) * 100 : 0;

    const [volume, setVolume] = useState(1);
    const volumePercent = volume * 100;

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        if (isPlaying && audioRef.current) {
            audioRef.current.play();
        } else if (!isPlaying && audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying, currentSong, volume]);

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play();
        } else if (!isPlaying && audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying, currentSong]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) => {
        if (time && !isNaN(time)) {
            const minutes = Math.floor(time / 60);
            const formatMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
            const seconds = Math.floor(time % 60);
            const formatSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
            return `${formatMinutes}:${formatSeconds}`;
        }
        return '00:00';
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleEnded = () => {
        playNext();
    };

    const handleVolumeChange = (e) => {
        setVolume(Number(e.target.value));
    };

    const handleToggleFavorite = async () => {
        if (!currentUser) {
            showToast('Vui lòng đăng ký hoặc đăng nhập để sử dụng tính năng này!', 'error');
            return;
        }

        if (!currentSong) return;

        try {
            await userService.toggleFavorite(currentUser.id, currentSong.id);
            await getUser();
        } catch (error) {
            console.error("Lỗi khi thêm vào yêu thích:", error);
        }
    };

    const isFavorite = () => {
        if (!currentUser || !currentSong) return false;
        return currentUser?.favoriteSongs?.some(fav => fav.id === currentSong.id);
    };

    if (!currentSong) {
        return (
            <div className="player-container justify-center">
                <p className="no-song-text">Hãy chọn một bài hát để phát</p>
            </div>
        );
    }

    const favorited = isFavorite();

    return (
        <div className="player-container">
            <audio
                ref={audioRef}
                src={currentSong.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            <div className="song-info-wrapper">
                <img
                    src={currentSong.album?.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80"}
                    alt="cover"
                    className="song-cover"
                />
                <div className="song-text-info">
                    <span className="player-song-title">{currentSong.title}</span>
                    <span className="player-song-artist">{currentSong.artist?.name || "Unknown Artist"}</span>
                </div>
                <button
                    className="ml-4 focus:outline-none"
                    onClick={handleToggleFavorite}
                >
                    <FiHeart className={`text-xl transition-colors ${favorited ? 'fill-green-500 text-green-500' : 'text-gray-400 hover:text-white'}`} />
                </button>
            </div>

            <div className="controls-wrapper">
                <div className="buttons-group">
                    <button
                        type="button"
                        className={`control-icon-btn ${isShuffle ? 'control-icon-btn-active' : ''}`}
                        onClick={() => setIsShuffle((prev) => !prev)}
                        title={isShuffle ? 'Tắt xáo trộn' : 'Bật xáo trộn'}
                        aria-label={isShuffle ? 'Turn off shuffle' : 'Turn on shuffle'}
                    >
                        <FiShuffle className="control-btn text-xl" />
                    </button>

                    <FiSkipBack className="control-btn text-xl" onClick={playPrev} />

                    <button onClick={togglePlay} className="play-pause-btn">
                        {isPlaying ? <FiPause className="text-xl text-black" /> : <FiPlay className="text-xl ml-1 text-black" />}
                    </button>

                    <FiSkipForward className="control-btn text-xl" onClick={playNext} />
                </div>

                <div className="progress-container">
                    <span>{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="progress-bar-input"

                        style={{ '--progress-percent': `${progressPercent}%` }}
                    />
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="volume-wrapper flex-1 justify-end">
                {volume === 0 ? <FiVolumeX className="text-xl" /> : <FiVolume2 className="text-xl" />}

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider-input"
                    style={{ '--volume-percent': `${volumePercent}%` }}
                />
            </div>
        </div>
    );
};

export default PlayerBar;
