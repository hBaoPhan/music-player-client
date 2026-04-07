import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const getUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedJwt = parseJwt(token);
            if (decodedJwt && decodedJwt.sub) {
                try {
                    const response = await axiosClient.get(`/users/username/${decodedJwt.sub}`);
                    setCurrentUser({
                        ...response,
                        avatar: 'https://i.pravatar.cc/150?img=11'
                    });
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin user:", error);
                    logout();
                }
            } else {
                logout();
            }
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        navigate('/login');
    };

    const isAdmin = currentUser?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, logout, getUser, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);