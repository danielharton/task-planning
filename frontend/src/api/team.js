/**
 * Team Management API
 */

import { getToken } from "../utils/utilFunctions";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Get manager's team (executors)
 * @returns {Promise<object>} Team members list
 */
export const apiGetTeam = async () => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/team`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get team error:', error);
        throw error;
    }
};

/**
 * Get executor's task history (Manager viewing team member)
 * @param {number} executorId - Executor ID
 * @returns {Promise<object>} Executor history
 */
export const apiGetExecutorHistory = async (executorId) => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/executors/${executorId}/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get executor history error:', error);
        throw error;
    }
};

/**
 * Get current executor's own history
 * @returns {Promise<object>} Own task history
 */
export const apiGetMyHistory = async () => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/my/history`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get my history error:', error);
        throw error;
    }
};
