import '../styles/Toast.css';
import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className="toast-container">
                    <div className={`toast-content toast-${toast.type}`}>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};


export const useToast = () => useContext(ToastContext);
