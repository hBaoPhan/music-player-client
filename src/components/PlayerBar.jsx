import React, { useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2 } from 'react-icons/fi';
import { usePlayer } from '../context/PlayerContext';
import '../styles/PlayerBar.css';

const PlayerBar = () => {
    const { currentSong, isPlaying, setIsPlaying } = usePlayer();
    const audioRef = useRef(null);

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

    if (!currentSong) {
        return (
            <div className="player-container justify-center">
                <p className="no-song-text">Hãy chọn một bài hát để phát</p>
            </div>
        );
    }

    return (
        <div className="player-container">
            <audio ref={audioRef} src={currentSong.audioUrl} />

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
            </div>

            <div className="controls-wrapper">
                <div className="buttons-group">
                    <FiSkipBack className="control-btn text-xl" />

                    <button onClick={togglePlay} className="play-pause-btn">
                        {isPlaying ? <FiPause className="text-xl" /> : <FiPlay className="text-xl ml-1" />}
                    </button>

                    <FiSkipForward className="control-btn text-xl" />
                </div>
                {/*progress bar*/}
            </div>

            <div className="volume-wrapper">
                <FiVolume2 className="text-xl" />
                <div className="w-24 h-1 bg-gray-600 rounded-full cursor-pointer">
                    <div className="w-1/2 h-full bg-white rounded-full hover:bg-green-500"></div>
                </div>
            </div>
        </div>
    );
};

export default PlayerBar;