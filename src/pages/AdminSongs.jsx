import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiMusic, FiSearch } from 'react-icons/fi';
import songService from '../services/songService';
import artistService from '../services/artistService';
import albumService from '../services/albumService';
import { useToast } from '../context/ToastContext';

const AdminSongs = () => {
    const { showToast } = useToast();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        audioUrl: '',
        duration: '',
        genre: 'OTHER',
        artist: { id: '' },
        album: { id: '' }
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [songsData, artistsData, albumsData] = await Promise.all([
                songService.getAllSongs(),
                artistService.getAllArtists(),
                albumService.getAllAlbums()
            ]);
            setSongs(songsData);
            setArtists(artistsData);
            setAlbums(albumsData);
        } catch (error) {
            showToast('Lỗi khi tải dữ liệu!', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredSongs = songs.filter(song => {
        const keyword = searchTerm.toLowerCase();
        return (
            (song.title && song.title.toLowerCase().includes(keyword)) ||
            (song.artist?.name && song.artist.name.toLowerCase().includes(keyword)) ||
            (song.album?.title && song.album.title.toLowerCase().includes(keyword))
        );
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'artistId') {
            setFormData({ ...formData, artist: { id: value } });
        } else if (name === 'albumId') {
            setFormData({ ...formData, album: { id: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            audioUrl: '',
            duration: '',
            genre: 'OTHER',
            artist: { id: '' },
            album: { id: '' }
        });
        setEditingSong(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (song) => {
        setEditingSong(song);
        setFormData({
            title: song.title || '',
            audioUrl: song.audioUrl || '',
            duration: song.duration || '',
            genre: song.genre || 'OTHER',
            artist: { id: song.artist?.id || '' },
            album: { id: song.album?.id || '' }
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            showToast('Tên bài hát không được để trống!', 'error');
            return;
        }

        const payload = {
            title: formData.title,
            audioUrl: formData.audioUrl,
            duration: formData.duration ? parseInt(formData.duration) : null,
            genre: formData.genre,
            artist: formData.artist.id ? { id: parseInt(formData.artist.id) } : null,
            album: formData.album.id ? { id: parseInt(formData.album.id) } : null
        };

        try {
            if (editingSong) {
                await songService.updateSong(editingSong.id, payload);
                showToast('Cập nhật bài hát thành công!', 'success');
            } else {
                await songService.createSong(payload);
                showToast('Thêm bài hát thành công!', 'success');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            const message = error.response?.data || 'Đã có lỗi xảy ra!';
            showToast(typeof message === 'string' ? message : 'Thao tác thất bại!', 'error');
        }
    };

    const handleDelete = async (songId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài hát này?')) return;
        try {
            await songService.deleteSong(songId);
            showToast('Xóa bài hát thành công!', 'success');
            fetchData();
        } catch (error) {
            showToast('Xóa bài hát thất bại!', 'error');
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="admin-title-section">
                    <FiMusic className="admin-title-icon" />
                    <h1 className="admin-title">Quản Lý Nhạc</h1>
                    <span className="admin-count-badge">{songs.length} bài hát</span>
                </div>
                <div className="admin-actions-bar">
                    <div className="admin-search-box">
                        <FiSearch className="admin-search-icon" />
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="Tìm kiếm bài hát..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="admin-add-btn" onClick={openCreateModal}>
                        <FiPlus />
                        <span>Thêm bài hát</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading">Đang tải...</div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên bài hát</th>
                                <th>Nghệ sĩ</th>
                                <th>Album</th>
                                <th>Thể loại</th>
                                <th>Thời lượng</th>
                                <th>Lượt nghe</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSongs.length > 0 ? (
                                filteredSongs.map(song => (
                                    <tr key={song.id}>
                                        <td className="admin-td-id">{song.id}</td>
                                        <td>
                                            <div className="admin-song-cell">
                                                <div className="admin-song-thumb">
                                                    {song.album?.coverUrl ? (
                                                        <img src={song.album.coverUrl} alt={song.title} />
                                                    ) : (
                                                        <div className="admin-song-thumb-fallback">
                                                            <FiMusic />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="admin-song-name">{song.title}</span>
                                            </div>
                                        </td>
                                        <td>{song.artist?.name || '—'}</td>
                                        <td>{song.album?.title || '—'}</td>
                                        <td>
                                            {song.genre ? (
                                                <span className="admin-genre-tag">{song.genre}</span>
                                            ) : '—'}
                                        </td>
                                        <td>{formatDuration(song.duration)}</td>
                                        <td>{song.playCount ?? 0}</td>
                                        <td>
                                            <div className="admin-row-actions">
                                                <button className="admin-edit-btn" onClick={() => openEditModal(song)} title="Sửa">
                                                    <FiEdit2 />
                                                </button>
                                                <button className="admin-delete-btn" onClick={() => handleDelete(song.id)} title="Xóa">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="admin-empty-row">
                                        Không tìm thấy bài hát nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                            <FiX />
                        </button>
                        <h3 className="admin-modal-title">
                            {editingSong ? 'Sửa bài hát' : 'Thêm bài hát mới'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Tên bài hát</label>
                                <input type="text" name="title" className="admin-form-input" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">URL âm thanh</label>
                                <input type="text" name="audioUrl" className="admin-form-input" value={formData.audioUrl} onChange={handleChange} />
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Thời lượng (giây)</label>
                                    <input type="number" name="duration" className="admin-form-input" value={formData.duration} onChange={handleChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Thể loại</label>
                                    <select name="genre" className="admin-form-input" value={formData.genre} onChange={handleChange}>
                                        <option value="POP">Pop</option>
                                        <option value="ROCK">Rock</option>
                                        <option value="HIPHOP">Hip-hop</option>
                                        <option value="RNB">R&B</option>
                                        <option value="EDM">EDM</option>
                                        <option value="JAZZ">Jazz</option>
                                        <option value="CLASSICAL">Classical</option>
                                        <option value="LOFI">Lofi</option>
                                        <option value="KPOP">K-Pop</option>
                                        <option value="VPOP">V-Pop</option>
                                        <option value="ACOUSTIC">Acoustic</option>
                                        <option value="INDIE">Indie</option>
                                        <option value="REMIX">Remix</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Nghệ sĩ</label>
                                    <select name="artistId" className="admin-form-input" value={formData.artist.id} onChange={handleChange}>
                                        <option value="">-- Chọn nghệ sĩ --</option>
                                        {artists.map(artist => (
                                            <option key={artist.id} value={artist.id}>{artist.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label className="admin-form-label">Album</label>
                                    <select name="albumId" className="admin-form-input" value={formData.album.id} onChange={handleChange}>
                                        <option value="">-- Chọn album --</option>
                                        {albums.map(album => (
                                            <option key={album.id} value={album.id}>{album.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="admin-modal-footer">
                                <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                                <button type="submit" className="admin-btn-submit">
                                    {editingSong ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSongs;
