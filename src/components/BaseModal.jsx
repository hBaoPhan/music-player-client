import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const BaseModal = ({
    isOpen = true,
    onClose,
    title,
    children,
    overlayClassName = "admin-modal-overlay",
    contentClassName = "admin-modal-content",
    closeBtnClassName = "admin-modal-close",
    titleClassName = "admin-modal-title"
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={overlayClassName} onClick={onClose}>
            <div className={contentClassName} onClick={(e) => e.stopPropagation()}>
                <button type="button" className={closeBtnClassName} onClick={onClose} aria-label="Đóng">
                    <FiX />
                </button>
                {title && <h3 className={titleClassName}>{title}</h3>}
                {children}
            </div>
        </div>
    );
};

export default BaseModal;
