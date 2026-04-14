import React, { useState, useEffect, useCallback } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiX,
    FiMusic, FiSearch, FiUser, FiDisc
} from 'react-icons/fi';
import songService from '../services/songService';
import artistService from '../services/artistService';
import albumService from '../services/albumService';
import { useToast } from '../context/ToastContext';
import '../styles/Admin.css';

const GENRES = [
    'POP', 'ROCK', 'HIPHOP', 'RNB', 'EDM',
    'JAZZ', 'CLASSICAL', 'LOFI', 'KPOP', 'VPOP',
    'ACOUSTIC', 'INDIE', 'REMIX', 'OTHER',
];

const TABS = [
    { key: 'songs', label: 'Bài hát', icon: FiMusic },
    { key: 'artists', label: 'Nghệ sĩ', icon: FiUser },
    { key: 'albums', label: 'Albums', icon: FiDisc },
];

const EMPTY_SONG = { title: '', audioUrl: '', duration: '', genre: 'OTHER', artist: { id: '' }, album: { id: '' } };
const EMPTY_ARTIST = { name: '', bio: '', avatarUrl: '' };
const EMPTY_ALBUM = { title: '', coverUrl: '', releaseDate: '', artist: { id: '' } };

const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const Modal = ({ title, onClose, children }) => (
    <div className="admin-modal-overlay" onClick={onClose}>
        <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={onClose} aria-label="Đóng"><FiX /></button>
            <h3 className="admin-modal-title">{title}</h3>
            {children}
        </div>
    </div>
);

const SongsTab = ({ songs, artists, albums, onRefresh, showToast }) => {
    const [search, setSearch] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_SONG);

    const filtered = songs.filter(s => {
        const kw = search.toLowerCase();
        const matchesSearch = (
            s.title?.toLowerCase().includes(kw) ||
            s.artist?.name?.toLowerCase().includes(kw) ||
            s.album?.title?.toLowerCase().includes(kw)
        );
        const matchesGenre = genreFilter ? s.genre === genreFilter : true;
        return matchesSearch && matchesGenre;
    });

    const openCreate = () => { setEditing(null); setForm(EMPTY_SONG); setShowModal(true); };
    const openEdit = (song) => {
        setEditing(song);
        setForm({
            title: song.title || '',
            audioUrl: song.audioUrl || '',
            duration: song.duration || '',
            genre: song.genre || 'OTHER',
            artist: { id: song.artist?.id || '' },
            album: { id: song.album?.id || '' },
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'artistId') setForm(f => ({ ...f, artist: { id: value } }));
        else if (name === 'albumId') setForm(f => ({ ...f, album: { id: value } }));
        else setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { showToast('Tên bài hát không được để trống!', 'error'); return; }
        const payload = {
            title: form.title,
            audioUrl: form.audioUrl,
            duration: form.duration ? parseInt(form.duration) : null,
            genre: form.genre,
            artist: form.artist.id ? { id: parseInt(form.artist.id) } : null,
            album: form.album.id ? { id: parseInt(form.album.id) } : null,
        };
        try {
            if (editing) {
                await songService.updateSong(editing.id, payload);
                showToast('Cập nhật bài hát thành công!', 'success');
            } else {
                await songService.createSong(payload);
                showToast('Thêm bài hát thành công!', 'success');
            }
            setShowModal(false);
            onRefresh();
        } catch (err) {
            const msg = err.response?.data;
            showToast(typeof msg === 'string' ? msg : 'Thao tác thất bại!', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài hát này?')) return;
        try {
            await songService.deleteSong(id);
            showToast('Xóa bài hát thành công!', 'success');
            onRefresh();
        } catch {
            showToast('Xóa bài hát thất bại!', 'error');
        }
    };

    return (
        <>
            <div className="admin-actions-bar">
                <div className="admin-search-group" style={{ display: 'flex', gap: '10px', flex: 1 }}>
                    <div className="admin-search-box" style={{ flex: 1, maxWidth: '300px' }}>
                        <FiSearch className="admin-search-icon" />
                        <input
                            id="search-songs"
                            type="text"
                            className="admin-search-input"
                            placeholder="Tìm kiếm bài hát..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select 
                        className="admin-search-input"
                        style={{ width: '180px', paddingLeft: '1rem', cursor: 'pointer', backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151', borderRadius: '8px' }}
                        value={genreFilter}
                        onChange={(e) => setGenreFilter(e.target.value)}
                    >
                        <option value="">Tất cả thể loại</option>
                        {GENRES.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>
                <button id="btn-add-song" className="admin-add-btn" onClick={openCreate}>
                    <FiPlus /><span>Thêm bài hát</span>
                </button>
            </div>

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
                        {filtered.length > 0 ? filtered.map(song => (
                            <tr key={song.id}>
                                <td className="admin-td-id">{song.id}</td>
                                <td>
                                    <div className="admin-song-cell">
                                        <div className="admin-song-thumb">
                                            {song.album?.coverUrl
                                                ? <img src={song.album.coverUrl} alt={song.title} />
                                                : <div className="admin-song-thumb-fallback"><FiMusic /></div>}
                                        </div>
                                        <span className="admin-song-name">{song.title}</span>
                                    </div>
                                </td>
                                <td>{song.artist?.name || '—'}</td>
                                <td>{song.album?.title || '—'}</td>
                                <td>{song.genre ? <span className="admin-genre-tag">{song.genre}</span> : '—'}</td>
                                <td>{formatDuration(song.duration)}</td>
                                <td>{song.playCount ?? 0}</td>
                                <td>
                                    <div className="admin-row-actions">
                                        <button id={`btn-edit-song-${song.id}`} className="admin-edit-btn" onClick={() => openEdit(song)} title="Sửa"><FiEdit2 /></button>
                                        <button id={`btn-delete-song-${song.id}`} className="admin-delete-btn" onClick={() => handleDelete(song.id)} title="Xóa"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" className="admin-empty-row">Không tìm thấy bài hát nào</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <Modal
                    title={editing ? 'Sửa bài hát' : 'Thêm bài hát mới'}
                    onClose={() => setShowModal(false)}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên bài hát</label>
                            <input id="song-title" type="text" name="title" className="admin-form-input" value={form.title} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">URL âm thanh</label>
                            <input id="song-audioUrl" type="text" name="audioUrl" className="admin-form-input" value={form.audioUrl} onChange={handleChange} />
                        </div>
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Thời lượng (giây)</label>
                                <input id="song-duration" type="number" name="duration" className="admin-form-input" value={form.duration} onChange={handleChange} />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Thể loại</label>
                                <select id="song-genre" name="genre" className="admin-form-input" value={form.genre} onChange={handleChange}>
                                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Nghệ sĩ</label>
                                <select id="song-artist" name="artistId" className="admin-form-input" value={form.artist.id} onChange={handleChange}>
                                    <option value="">-- Chọn nghệ sĩ --</option>
                                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Album</label>
                                <select id="song-album" name="albumId" className="admin-form-input" value={form.album.id} onChange={handleChange}>
                                    <option value="">-- Chọn album --</option>
                                    {albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button type="submit" className="admin-btn-submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

const ArtistsTab = ({ artists, onRefresh, showToast }) => {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_ARTIST);

    const filtered = artists.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()));

    const openCreate = () => { setEditing(null); setForm(EMPTY_ARTIST); setShowModal(true); };
    const openEdit = (artist) => { setEditing(artist); setForm({ name: artist.name || '', bio: artist.bio || '', avatarUrl: artist.avatarUrl || '' }); setShowModal(true); };

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { showToast('Tên nghệ sĩ không được để trống!', 'error'); return; }
        try {
            if (editing) {
                await artistService.updateArtist(editing.id, form);
                showToast('Cập nhật nghệ sĩ thành công!', 'success');
            } else {
                await artistService.createArtist(form);
                showToast('Thêm nghệ sĩ thành công!', 'success');
            }
            setShowModal(false);
            onRefresh();
        } catch (err) {
            const msg = err.response?.data;
            showToast(typeof msg === 'string' ? msg : 'Thao tác thất bại!', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa nghệ sĩ này?')) return;
        try {
            await artistService.deleteArtist(id);
            showToast('Xóa nghệ sĩ thành công!', 'success');
            onRefresh();
        } catch {
            showToast('Xóa nghệ sĩ thất bại!', 'error');
        }
    };

    return (
        <>
            <div className="admin-actions-bar">
                <div className="admin-search-box">
                    <FiSearch className="admin-search-icon" />
                    <input
                        id="search-artists"
                        type="text"
                        className="admin-search-input"
                        placeholder="Tìm kiếm nghệ sĩ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button id="btn-add-artist" className="admin-add-btn" onClick={openCreate}>
                    <FiPlus /><span>Thêm nghệ sĩ</span>
                </button>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nghệ sĩ</th>
                            <th>Bio</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(artist => (
                            <tr key={artist.id}>
                                <td className="admin-td-id">{artist.id}</td>
                                <td>
                                    <div className="admin-song-cell">
                                        <div className="admin-song-thumb">
                                            {artist.avatarUrl
                                                ? <img src={artist.avatarUrl} alt={artist.name} />
                                                : <div className="admin-song-thumb-fallback"><FiUser /></div>}
                                        </div>
                                        <span className="admin-song-name">{artist.name}</span>
                                    </div>
                                </td>
                                <td className="admin-td-bio">{artist.bio || '—'}</td>
                                <td>
                                    <div className="admin-row-actions">
                                        <button id={`btn-edit-artist-${artist.id}`} className="admin-edit-btn" onClick={() => openEdit(artist)} title="Sửa"><FiEdit2 /></button>
                                        <button id={`btn-delete-artist-${artist.id}`} className="admin-delete-btn" onClick={() => handleDelete(artist.id)} title="Xóa"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="admin-empty-row">Không tìm thấy nghệ sĩ nào</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <Modal
                    title={editing ? 'Sửa nghệ sĩ' : 'Thêm nghệ sĩ mới'}
                    onClose={() => setShowModal(false)}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên nghệ sĩ</label>
                            <input id="artist-name" type="text" name="name" className="admin-form-input" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Avatar URL</label>
                            <input id="artist-avatarUrl" type="text" name="avatarUrl" className="admin-form-input" value={form.avatarUrl} onChange={handleChange} placeholder="https://..." />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Bio</label>
                            <textarea id="artist-bio" name="bio" className="admin-form-input admin-form-textarea" value={form.bio} onChange={handleChange} rows={3} placeholder="Giới thiệu về nghệ sĩ..." />
                        </div>
                        <div className="admin-modal-footer">
                            <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button type="submit" className="admin-btn-submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

const AlbumsTab = ({ albums, artists, onRefresh, showToast }) => {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_ALBUM);

    const filtered = albums.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.artist?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => { setEditing(null); setForm(EMPTY_ALBUM); setShowModal(true); };
    const openEdit = (album) => {
        setEditing(album);
        setForm({
            title: album.title || '',
            coverUrl: album.coverUrl || '',
            releaseDate: album.releaseDate || '',
            artist: { id: album.artist?.id || '' },
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'artistId') setForm(f => ({ ...f, artist: { id: value } }));
        else setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { showToast('Tên album không được để trống!', 'error'); return; }
        const payload = {
            title: form.title,
            coverUrl: form.coverUrl,
            releaseDate: form.releaseDate || null,
            artist: form.artist.id ? { id: parseInt(form.artist.id) } : null,
        };
        try {
            if (editing) {
                await albumService.updateAlbum(editing.id, payload);
                showToast('Cập nhật album thành công!', 'success');
            } else {
                await albumService.createAlbum(payload);
                showToast('Thêm album thành công!', 'success');
            }
            setShowModal(false);
            onRefresh();
        } catch (err) {
            const msg = err.response?.data;
            showToast(typeof msg === 'string' ? msg : 'Thao tác thất bại!', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa album này?')) return;
        try {
            await albumService.deleteAlbum(id);
            showToast('Xóa album thành công!', 'success');
            onRefresh();
        } catch {
            showToast('Xóa album thất bại!', 'error');
        }
    };

    return (
        <>
            <div className="admin-actions-bar">
                <div className="admin-search-box">
                    <FiSearch className="admin-search-icon" />
                    <input
                        id="search-albums"
                        type="text"
                        className="admin-search-input"
                        placeholder="Tìm kiếm album..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button id="btn-add-album" className="admin-add-btn" onClick={openCreate}>
                    <FiPlus /><span>Thêm album</span>
                </button>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Album</th>
                            <th>Nghệ sĩ</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(album => (
                            <tr key={album.id}>
                                <td className="admin-td-id">{album.id}</td>
                                <td>
                                    <div className="admin-song-cell">
                                        <div className="admin-song-thumb">
                                            {album.coverUrl
                                                ? <img src={album.coverUrl} alt={album.title} />
                                                : <div className="admin-song-thumb-fallback"><FiDisc /></div>}
                                        </div>
                                        <span className="admin-song-name">{album.title}</span>
                                    </div>
                                </td>
                                <td>{album.artist?.name || '—'}</td>
                                <td>
                                    <div className="admin-row-actions">
                                        <button id={`btn-edit-album-${album.id}`} className="admin-edit-btn" onClick={() => openEdit(album)} title="Sửa"><FiEdit2 /></button>
                                        <button id={`btn-delete-album-${album.id}`} className="admin-delete-btn" onClick={() => handleDelete(album.id)} title="Xóa"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="admin-empty-row">Không tìm thấy album nào</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <Modal
                    title={editing ? 'Sửa album' : 'Thêm album mới'}
                    onClose={() => setShowModal(false)}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Tên album</label>
                            <input id="album-title" type="text" name="title" className="admin-form-input" value={form.title} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Cover URL</label>
                            <input id="album-coverUrl" type="text" name="coverUrl" className="admin-form-input" value={form.coverUrl} onChange={handleChange} placeholder="https://..." />
                        </div>
                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Nghệ sĩ</label>
                                <select id="album-artist" name="artistId" className="admin-form-input" value={form.artist.id} onChange={handleChange}>
                                    <option value="">-- Chọn nghệ sĩ --</option>
                                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Ngày phát hành</label>
                                <input
                                    id="album-releaseDate"
                                    type="date"
                                    name="releaseDate"
                                    className="admin-form-input"
                                    value={form.releaseDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button type="submit" className="admin-btn-submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

const AdminSongs = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('songs');
    const [songs, setSongs] = useState([]);
    const [artists, setArtists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [songsData, artistsData, albumsData] = await Promise.all([
                songService.getAllSongs(),
                artistService.getAllArtists(),
                albumService.getAllAlbums(),
            ]);
            setSongs(songsData);
            setArtists(artistsData);
            setAlbums(albumsData);
        } catch {
            showToast('Lỗi khi tải dữ liệu!', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const counts = { songs: songs.length, artists: artists.length, albums: albums.length };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="admin-title-section">
                    <FiMusic className="admin-title-icon" />
                    <h1 className="admin-title">Quản Lý Catalog</h1>
                </div>

                {/* Tab navigation */}
                <div className="admin-tab-bar">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            id={`tab-${key}`}
                            className={`admin-tab-btn${activeTab === key ? ' admin-tab-btn--active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            <Icon className="admin-tab-icon" />
                            <span>{label}</span>
                            <span className="admin-tab-count">{counts[key]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="admin-loading">Đang tải...</div>
            ) : (
                <div className="admin-tab-content">
                    {activeTab === 'songs' && <SongsTab songs={songs} artists={artists} albums={albums} onRefresh={fetchData} showToast={showToast} />}
                    {activeTab === 'artists' && <ArtistsTab artists={artists} onRefresh={fetchData} showToast={showToast} />}
                    {activeTab === 'albums' && <AlbumsTab albums={albums} artists={artists} onRefresh={fetchData} showToast={showToast} />}
                </div>
            )}
        </div>
    );
};

export default AdminSongs;
