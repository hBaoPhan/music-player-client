import React, { useState } from 'react';
import { FiX, FiUser, FiKey, FiMail, FiEdit3, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import userService from '../services/userService';

const UserProfileModal = ({ onClose }) => {
    const { currentUser, getUser } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile form state
    const [profileData, setProfileData] = useState({
        username: currentUser?.username || '',
        email: currentUser?.email || ''
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);

    // Password form state
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!profileData.username.trim()) {
            showToast('Tên người dùng không được để trống!', 'error');
            return;
        }

        if (!profileData.email.trim()) {
            showToast('Email không được để trống!', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email)) {
            showToast('Email không hợp lệ!', 'error');
            return;
        }

        setProfileLoading(true);
        try {
            await userService.updateProfile(currentUser.id, {
                username: profileData.username,
                email: profileData.email
            });
            showToast('Cập nhật thông tin thành công!', 'success');
            setIsEditingProfile(false);
            await getUser();
        } catch (error) {
            const message = error.response?.data || 'Đã có lỗi xảy ra!';
            showToast(typeof message === 'string' ? message : 'Cập nhật thất bại!', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Mật khẩu mới không khớp!', 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showToast('Mật khẩu mới phải có ít nhất 8 ký tự!', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            await authService.changePassword(
                currentUser.username,
                passwordData.oldPassword,
                passwordData.newPassword
            );
            showToast('Đổi mật khẩu thành công!', 'success');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const message = error.response?.data || 'Đã có lỗi xảy ra!';
            showToast(typeof message === 'string' ? message : 'Mật khẩu cũ không chính xác!', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setProfileData({
            username: currentUser?.username || '',
            email: currentUser?.email || ''
        });
        setIsEditingProfile(false);
    };

    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="profile-modal-close-btn" onClick={onClose}>
                    <FiX />
                </button>

                <div className="profile-modal-header">
                    <div className="profile-avatar-large">
                        <span>{currentUser?.username?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <h3 className="profile-modal-username">{currentUser?.username}</h3>
                    <p className="profile-modal-role">
                        {currentUser?.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
                    </p>
                </div>

                <div className="profile-tab-nav">
                    <button
                        className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FiUser />
                        <span>Thông tin</span>
                    </button>
                    <button
                        className={`profile-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <FiKey />
                        <span>Đổi mật khẩu</span>
                    </button>
                </div>

                <div className="profile-tab-content">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit}>
                            <div className="profile-info-group">
                                <label className="profile-info-label">
                                    <FiUser className="profile-label-icon" />
                                    Tên người dùng
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        name="username"
                                        className="profile-info-input"
                                        value={profileData.username}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                ) : (
                                    <p className="profile-info-value">{currentUser?.username}</p>
                                )}
                            </div>

                            <div className="profile-info-group">
                                <label className="profile-info-label">
                                    <FiMail className="profile-label-icon" />
                                    Email
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="email"
                                        name="email"
                                        className="profile-info-input"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                ) : (
                                    <p className="profile-info-value">{currentUser?.email}</p>
                                )}
                            </div>

                            <div className="profile-actions">
                                {isEditingProfile ? (
                                    <>
                                        <button
                                            type="button"
                                            className="profile-btn-cancel"
                                            onClick={handleCancelEdit}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="profile-btn-save"
                                            disabled={profileLoading}
                                        >
                                            <FiCheck />
                                            {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        className="profile-btn-edit"
                                        onClick={() => setIsEditingProfile(true)}
                                    >
                                        <FiEdit3 />
                                        Chỉnh sửa thông tin
                                    </button>
                                )}
                            </div>
                        </form>
                    )}

                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="profile-info-group">
                                <label className="profile-info-label">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    className="profile-info-input"
                                    placeholder="••••••••"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            <div className="profile-info-group">
                                <label className="profile-info-label">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    className="profile-info-input"
                                    placeholder="••••••••"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            <div className="profile-info-group">
                                <label className="profile-info-label">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="profile-info-input"
                                    placeholder="••••••••"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            <div className="profile-actions">
                                <button
                                    type="submit"
                                    className="profile-btn-save"
                                    disabled={passwordLoading}
                                >
                                    <FiKey />
                                    {passwordLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
