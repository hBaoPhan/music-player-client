import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

import '../styles/Login.css';

const Login = () => {
    const { setCurrentUser, getUser } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(username, password);
            console.log(response) ///////////////////////// console log token ///////////////
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

    return (
        <div className="login-wrapper">
            <div className="login-box">

                <div className="text-center">
                    <h2 className="title-main">Spotifour</h2>
                    <p className="title-sub">Hòa mình vào thế giới âm nhạc của bạn</p>
                </div>

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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`btn-primary ${loading ? 'btn-disabled' : ''}`}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-400">
                    Chưa có tài khoản?{' '}
                    <span
                        className="font-medium text-green-500 cursor-pointer hover:underline"
                        onClick={() => navigate('/register')}
                    >
                        Đăng ký ngay
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;