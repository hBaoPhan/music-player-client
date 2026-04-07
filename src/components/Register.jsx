import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

import '../styles/Login.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu nhập lại không khớp!');
            return;
        }

        setLoading(true);

        try {
            await authService.register(username, password, email);
            setSuccess('Đăng ký tài khoản thành công! điều hướng đến trang Đăng nhập...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data && typeof err.response.data === 'string') {
                setError(err.response.data);
            } else {
                setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!');
            }
            console.error("Lỗi đăng ký:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box">
                <div className="text-center">
                    <h2 className="title-main">SPOTIFOUR</h2>
                    <p className="title-sub">Bắt đầu hành trình âm nhạc của bạn</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <div>
                            <label className="input-label">Tên đăng nhập</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                placeholder=""
                            />
                        </div>

                        <div>
                            <label className="input-label">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="example@email.com"
                            />
                        </div>

                        <div>
                            <label className="input-label">Mật khẩu</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder=""
                            />
                        </div>

                        <div>
                            <label className="input-label">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                placeholder=""
                            />
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="p-3 text-sm text-green-500 bg-green-100/10 rounded-lg text-center border border-green-500/50">{success}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn-primary ${loading ? 'btn-disabled' : ''}`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-400">
                    Đã có tài khoản?{' '}
                    <span
                        className="font-medium text-green-500 cursor-pointer hover:underline"
                        onClick={() => navigate('/login')}
                    >
                        Đăng nhập
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;
