import React from 'react';
import { FiMusic } from 'react-icons/fi';
import '../styles/PlaylistCoverCollage.css';

// Ghép collage 2x2 từ mảng URL ảnh.
// Nếu không đủ 4 ảnh hợp lệ → hiển thị placeholder mặc định.
const PlaylistCoverCollage = ({ songs = [], covers: rawCovers, className = "w-full" }) => {
    const covers = rawCovers
        ? rawCovers.filter(Boolean).slice(0, 4)
        : songs.map(s => s.album?.coverUrl).filter(Boolean).slice(0, 4);

    // Chỉ hiển thị collage khi có đúng 4 ảnh
    if (covers.length < 4) {
        return (
            <div className={`playlist-cover-placeholder ${className}`}>
                <FiMusic />
            </div>
        );
    }

    return (
        <div className={`playlist-cover-collage ${className}`}>
            {covers.map((url, i) => (
                <img key={i} src={url} alt="" />
            ))}
        </div>
    );
};

export default PlaylistCoverCollage;
