import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const AdminActionButtons = ({ 
    onEdit, 
    onDelete, 
    editId, 
    deleteId, 
    editTitle = "Sửa", 
    deleteTitle = "Xóa",
    editDisabled = false,
    deleteDisabled = false 
}) => {
    return (
        <div className="admin-row-actions">
            <button 
                id={editId} 
                className="admin-edit-btn" 
                onClick={onEdit} 
                title={editTitle}
                disabled={editDisabled}
            >
                <FiEdit2 />
            </button>
            <button 
                id={deleteId} 
                className="admin-delete-btn" 
                onClick={onDelete} 
                title={deleteTitle}
                disabled={deleteDisabled}
            >
                <FiTrash2 />
            </button>
        </div>
    );
};

export default AdminActionButtons;
