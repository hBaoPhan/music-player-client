import React from 'react';
import { FiSearch } from 'react-icons/fi';

const AdminSearchBox = ({ id, placeholder, value, onChange, className = "admin-search-box" }) => {
    return (
        <div className={className}>
            <FiSearch className="admin-search-icon" />
            <input
                id={id}
                type="text"
                className="admin-search-input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default AdminSearchBox;
