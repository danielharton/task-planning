/**
 * Utility Functions for Airport Task Planner
 */

import { toast } from "react-toastify";

export const NEEDS_UPDATE_STRING = 'needs_update';

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token
 */
export const storeToken = (token) => {
    localStorage.setItem('token', token);
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = () => {
    localStorage.removeItem('token');
};

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Store user data in localStorage
 * @param {object} user - User object
 */
export const storeUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Get user data from localStorage
 * @returns {object|null} User object
 */
export const getStoredUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

/**
 * Clear all auth data from localStorage
 */
export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Show error toast notification
 * @param {string} message - Error message
 */
export const showErrorToast = (message) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

/**
 * Show success toast notification
 * @param {string} message - Success message
 */
export const showSuccessToast = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

/**
 * Check if menu should be shown based on user role
 * @param {object} user - User object with role
 * @param {object} menu - Menu item with roles array
 * @returns {boolean} Whether menu should be shown
 */
export const shouldShowMenu = (user, menu) => {
    if (!user || !user.role) return false;
    if (!menu.roles || menu.roles.length === 0) return true;
    return menu.roles.includes(user.role);
};

/**
 * Format date to localized string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get status chip color
 * @param {string} status - Task status
 * @returns {string} MUI color name
 */
export const getStatusColor = (status) => {
    const colors = {
        OPEN: 'info',
        PENDING: 'warning',
        COMPLETED: 'success',
        CLOSED: 'default'
    };
    return colors[status] || 'default';
};

/**
 * Custom styles for text fields
 * @param {boolean} hasValue - Whether field has value
 * @returns {object} MUI sx styles
 */
export const addStyleToTextField = (hasValue) => {
    return {
        '& .MuiInputLabel-root': {
            '&.Mui-focused': {
                color: '#1565c0'
            },
            '&.MuiInputLabel-shrink': {
                color: '#1565c0'
            },
        },
        '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
                borderColor: '#1565c0',
            },
            '&:hover fieldset': {
                borderColor: '#1565c0'
            }
        },
        ...(hasValue && {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1565c0',
            },
            '& .MuiInputLabel-root': {
                color: '#1565c0',
            },
        }),
    };
};
