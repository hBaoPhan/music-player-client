import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

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
            setError('Tên đăng nhập/email hoặc mật khẩu không chính xác!');
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
                                <label className="input-label">Tên đăng nhập hoặc Email</label>
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

                        <div className="relative flex items-center justify-center w-full mt-6 border-t border-gray-600">
                            <span className="absolute px-2 text-sm text-gray-400 bg-neutral-900">hoặc</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
                            className="flex items-center justify-center w-full gap-2 p-3 text-sm font-medium transition-all bg-white border border-transparent rounded-full text-zinc-900 hover:bg-gray-200 mt-4"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Tiếp tục với Google
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