import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
    const { isAdmin, currentUser } = useAuth();

    // Trong trường hợp token không hợp lệ hoặc user chưa load ra
    if (!currentUser) return null;

    return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
