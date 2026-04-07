import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

import '../styles/Login.css';

const Login = () => {
    const { setCurrentUser, getUser } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authService.login(username, password);
            localStorage.setItem('token', response.token);

            await getUser();
            navigate('/');
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
            console.error("Lỗi đăng nhập:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSuccess('Đã gửi yêu cầu khôi phục mật khẩu. Vui lòng kiểm tra email của bạn!');
            setEmail('');
        } catch (err) {
            if (err.response && err.response.data && typeof err.response.data === 'string') {
                setError(err.response.data);
            } else {
                setError('Không thể gửi yêu cầu. Vui lòng kiểm tra lại email!');
            }
            console.error("Lỗi quên mật khẩu:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box">

                <div className="text-center">
                    <h2 className="title-main">SPOTIFOUR</h2>
                    <p className="title-sub">{isForgotPassword ? 'Khôi phục mật khẩu của bạn' : 'Hòa mình vào thế giới âm nhạc của bạn'}</p>
                </div>

                {isForgotPassword ? (
                    <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                        <div className="space-y-4">
                            <div>
                                <label className="input-label">Email đã đăng ký</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="example@email.com"
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
                            {loading ? 'Đang gửi...' : 'Khôi phục mật khẩu'}
                        </button>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="p-3 text-sm text-green-500 bg-green-100/10 rounded-lg text-center border border-green-500/50">{success}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn-primary ${loading ? 'btn-disabled' : ''}`}
                        >
                            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                        </button>
                    </form>
                )}

                <div className="flex flex-col gap-3 mt-6">
                    {isForgotPassword ? (
                        <p 
                            className='text-sm text-center text-gray-400 cursor-pointer hover:underline' 
                            onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
                        >
                            Quay lại đăng nhập
                        </p>
                    ) : (
                        <p 
                            className='text-sm text-center text-gray-400 cursor-pointer hover:underline' 
                            onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                        >
                            Quên mật khẩu?
                        </p>
                    )}

                    {!isForgotPassword && (
                        <p className="text-sm text-center text-gray-400">
                            Chưa có tài khoản?{' '}
                            <span
                                className="font-medium text-green-500 cursor-pointer hover:underline"
                                onClick={() => navigate('/register')}
                            >
                                Đăng ký ngay
                            </span>
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Login;