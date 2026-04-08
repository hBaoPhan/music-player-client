import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import '../styles/ChangePasswordModal.css';

const ChangePasswordModal = ({ onClose }) => {
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            showToast('Mật khẩu mới không khớp!', 'error');
            return;
        }

        if (formData.newPassword.length < 6) {
            showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword(
                currentUser.username,
                formData.oldPassword,
                formData.newPassword
            );
            showToast('Đổi mật khẩu thành công!', 'success');
            onClose();
        } catch (error) {
            const message = error.response?.data || 'Đã có lỗi xảy ra!';
            showToast(typeof message === 'string' ? message : 'Mật khẩu cũ không chính xác!', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FiX />
                </button>
                <h3 className="modal-title">Đổi mật khẩu</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            name="oldPassword"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mật khẩu mới</label>
                        <input
                            type="password"
                            name="newPassword"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
