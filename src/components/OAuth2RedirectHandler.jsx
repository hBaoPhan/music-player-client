import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getUser } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        const getUrlParameter = (name) => {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            const results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const token = getUrlParameter('token');
        const refreshToken = getUrlParameter('refreshToken');
        if (token) {
            localStorage.setItem('token', token);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            getUser().then(() => {
                navigate('/');
            }).catch(err => {
                console.error('Lỗi khi lấy thông tin user sau OAuth2:', err);
                navigate('/login');
            });
        } else {
            const code = getUrlParameter('code');
            const message = getUrlParameter('message');
            const params = new URLSearchParams();
            if (code) params.set('code', code);
            if (message) params.set('message', message);
            navigate(`/login${params.toString() ? `?${params.toString()}` : ''}`);
        }
    }, [location, navigate, getUser, showToast]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#121212] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                <h2 className="text-lg font-medium text-gray-300">Đang xử lý đăng nhập...</h2>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
