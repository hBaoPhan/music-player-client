import '../styles/Admin.css';
import React, { useState, useEffect } from 'react';
import { FiUsers, FiShield, FiUser } from 'react-icons/fi';
import userService from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import BaseModal from '../components/BaseModal';
import AdminSearchBox from '../components/AdminSearchBox';
import AdminActionButtons from '../components/AdminActionButtons';

const RoleModal = ({ user, onClose, onSaved }) => {
    const { showToast } = useToast();
    const [selected, setSelected] = useState(user.role);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (selected === user.role) { onClose(); return; }
        setLoading(true);
        try {
            await userService.updateUserRole(user.id, selected);
            showToast(`Đã cập nhật role của "${user.username}" thành ${selected}!`, 'success');
            onSaved();
            onClose();
        } catch (err) {
            const msg = err.response?.data;
            showToast(typeof msg === 'string' ? msg : 'Cập nhật role thất bại!', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal
            onClose={onClose}
            title="Thay đổi vai trò"
            contentClassName="admin-modal-content admin-role-modal"
        >

            <div className="admin-role-user-info">
                <div className="admin-user-avatar admin-role-avatar">
                    <span>{user.username?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <div>
                    <p className="admin-role-username">{user.username}</p>
                    <p className="admin-role-email">{user.email}</p>
                </div>
            </div>

            <p className="admin-role-label">Chọn vai trò mới:</p>

            <div className="admin-role-options">
                <button
                    id="role-option-user"
                    type="button"
                    className={`admin-role-option${selected === 'USER' ? ' admin-role-option--selected admin-role-option--user' : ''}`}
                    onClick={() => setSelected('USER')}
                >
                    <div className="admin-role-option-icon admin-role-option-icon--user">
                        <FiUser />
                    </div>
                    <div>
                        <p className="admin-role-option-name">User</p>
                        <p className="admin-role-option-desc">Người dùng thông thường</p>
                    </div>
                    {selected === 'USER' && <span className="admin-role-option-check">✓</span>}
                </button>

                <button
                    id="role-option-admin"
                    type="button"
                    className={`admin-role-option${selected === 'ADMIN' ? ' admin-role-option--selected admin-role-option--admin' : ''}`}
                    onClick={() => setSelected('ADMIN')}
                >
                    <div className="admin-role-option-icon admin-role-option-icon--admin">
                        <FiShield />
                    </div>
                    <div>
                        <p className="admin-role-option-name">Admin</p>
                        <p className="admin-role-option-desc">Toàn quyền quản trị</p>
                    </div>
                    {selected === 'ADMIN' && <span className="admin-role-option-check">✓</span>}
                </button>
            </div>

            <div className="admin-modal-footer">
                <button type="button" className="admin-btn-cancel" onClick={onClose}>Hủy</button>
                <button
                    id="btn-save-role"
                    type="button"
                    className="admin-btn-submit"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </BaseModal>
    );
};

const AdminUsers = () => {
    const { showToast } = useToast();
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleTarget, setRoleTarget] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch {
            showToast('Lỗi khi tải danh sách người dùng!', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = users.filter(user => {
        const keyword = searchTerm.toLowerCase();
        return (
            (user.username && user.username.toLowerCase().includes(keyword)) ||
            (user.email && user.email.toLowerCase().includes(keyword))
        );
    });

    const handleDelete = async (userId, username) => {
        if (currentUser && currentUser.id === userId) {
            showToast('Bạn không thể xóa tài khoản của chính mình!', 'error');
            return;
        }
        if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${username}"?`)) return;
        try {
            await userService.deleteUser(userId);
            showToast('Xóa người dùng thành công!', 'success');
            fetchUsers();
        } catch {
            showToast('Xóa người dùng thất bại!', 'error');
        }
    };

    const getRoleBadge = (role) => {
        if (role === 'ADMIN') {
            return (
                <span className="admin-role-badge admin-role-admin">
                    <FiShield /> Admin
                </span>
            );
        }
        return (
            <span className="admin-role-badge admin-role-user">
                <FiUser /> User
            </span>
        );
    };

    const isSelf = (userId) => currentUser && currentUser.id === userId;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="admin-title-section">
                    <FiUsers className="admin-title-icon" />
                    <h1 className="admin-title">Quản Lý Người Dùng</h1>
                    <span className="admin-count-badge">{users.length} người dùng</span>
                </div>
                <div className="admin-actions-bar">
                    <AdminSearchBox
                        id="search-users"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                <th>Người dùng</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Ngày tham gia</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="admin-td-id">{user.id}</td>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar">
                                                    <span>{user.username?.charAt(0).toUpperCase() || 'U'}</span>
                                                </div>
                                                <span className="admin-user-name">{user.username}</span>
                                                {isSelf(user.id) && (
                                                    <span className="admin-self-tag">Bạn</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="admin-td-email">{user.email}</td>
                                        <td>{getRoleBadge(user.role)}</td>
                                        <td className="admin-td-date">
                                            {user.createdAt ? new Intl.DateTimeFormat('vi-VN').format(new Date(user.createdAt)) : '—'}
                                        </td>
                                        <td>
                                            <AdminActionButtons
                                                editId={`btn-edit-role-${user.id}`}
                                                deleteId={`btn-delete-user-${user.id}`}
                                                editTitle="Thay đổi vai trò"
                                                onEdit={() => setRoleTarget(user)}
                                                onDelete={() => handleDelete(user.id, user.username)}
                                                editDisabled={isSelf(user.id)}
                                                deleteDisabled={isSelf(user.id)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="admin-empty-row">
                                        Không tìm thấy người dùng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {roleTarget && (
                <RoleModal
                    user={roleTarget}
                    onClose={() => setRoleTarget(null)}
                    onSaved={fetchUsers}
                />
            )}
        </div>
    );
};

export default AdminUsers;
