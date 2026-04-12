import '../styles/Admin.css';
import React, { useState, useEffect } from 'react';
import { FiTrash2, FiUsers, FiSearch, FiShield, FiUser } from 'react-icons/fi';
import userService from '../services/userService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
    const { showToast } = useToast();
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            showToast('Lỗi khi tải danh sách người dùng!', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
        } catch (error) {
            showToast('Xóa người dùng thất bại!', 'error');
        }
    };

    const getRoleBadge = (role) => {
        if (role === 'ADMIN') {
            return (
                <span className="admin-role-badge admin-role-admin">
                    <FiShield />
                    Admin
                </span>
            );
        }
        return (
            <span className="admin-role-badge admin-role-user">
                <FiUser />
                User
            </span>
        );
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="admin-title-section">
                    <FiUsers className="admin-title-icon" />
                    <h1 className="admin-title">Quản Lý Người Dùng</h1>
                    <span className="admin-count-badge">{users.length} người dùng</span>
                </div>
                <div className="admin-actions-bar">
                    <div className="admin-search-box">
                        <FiSearch className="admin-search-icon" />
                        <input
                            type="text"
                            className="admin-search-input"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                            </div>
                                        </td>
                                        <td className="admin-td-email">{user.email}</td>
                                        <td>{getRoleBadge(user.role)}</td>
                                        <td>
                                            <div className="admin-row-actions">
                                                <button
                                                    className="admin-delete-btn"
                                                    onClick={() => handleDelete(user.id, user.username)}
                                                    title="Xóa"
                                                    disabled={currentUser && currentUser.id === user.id}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
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
        </div>
    );
};

export default AdminUsers;
