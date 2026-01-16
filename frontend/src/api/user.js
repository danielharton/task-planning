/**
 * User Management API
 */

import { getToken } from "../utils/utilFunctions";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Get all users (Admin only)
 * @returns {Promise<object>} Users list
 */
export const apiGetUsers = async () => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get users error:', error);
        throw error;
    }
};

/**
 * Create a new user (Admin only)
 * @param {object} userData - User data (name, email, password, role, manager_id)
 * @returns {Promise<object>} Created user
 */
export const apiCreateUser = async (userData) => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        return await response.json();
    } catch (error) {
        console.error('Create user error:', error);
        throw error;
    }
};

/**
 * Update user (Admin only)
 * @param {number} userId - User ID
 * @param {object} userData - Updated user data
 * @returns {Promise<object>} Updated user
 */
export const apiUpdateUser = async (userId, userData) => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        return await response.json();
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
};

/**
 * Get list of managers (for assigning to executors)
 * @returns {Promise<object>} Managers list
 */
export const apiGetManagers = async () => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/users/managers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get managers error:', error);
        throw error;
    }
};
