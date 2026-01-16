/**
 * Authentication API
 */

import { getToken, showErrorToast } from "../utils/utilFunctions";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User data and token
 */
export const apiLogin = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        // Also get token from header if available
        const headerToken = response.headers.get('X-Auth-Token');
        if (headerToken && data.data) {
            data.data.token = headerToken;
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Check if user is logged in and get user data
 * @param {function} errorCallback - Called on error
 * @param {function} setUser - Called with user data on success
 */
export const apiCheckLogin = async (errorCallback, setUser) => {
    const token = getToken();
    
    if (!token) {
        errorCallback && errorCallback();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!data.success) {
            errorCallback && errorCallback();
        } else {
            setUser && setUser(data.data);
        }
    } catch (error) {
        console.error('Check login error:', error);
        errorCallback && errorCallback();
    }
};

/**
 * Get current user info
 * @returns {Promise<object>} User data
 */
export const apiGetMe = async () => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get me error:', error);
        throw error;
    }
};
