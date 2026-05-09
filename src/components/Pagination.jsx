import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../styles/Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="admin-pagination">
            <button 
                className="admin-pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <FiChevronLeft /> Trước
            </button>
            <span className="admin-pagination-info">
                Trang {currentPage} / {totalPages}
            </span>
            <button 
                className="admin-pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Sau <FiChevronRight />
            </button>
        </div>
    );
};

export default Pagination;
