/**
 * Task Management API
 */

import { getToken } from "../utils/utilFunctions";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Get tasks (role-based)
 * @returns {Promise<object>} Tasks list
 */
export const apiGetTasks = async () => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get tasks error:', error);
        throw error;
    }
};

/**
 * Create a new task (Manager only)
 * @param {object} taskData - Task data (title, description)
 * @returns {Promise<object>} Created task
 */
export const apiCreateTask = async (taskData) => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });

        return await response.json();
    } catch (error) {
        console.error('Create task error:', error);
        throw error;
    }
};

/**
 * Assign task to executor (Manager only)
 * @param {number} taskId - Task ID
 * @param {number} executorId - Executor ID
 * @returns {Promise<object>} Updated task
 */
export const apiAssignTask = async (taskId, executorId) => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ executor_id: executorId })
        });

        return await response.json();
    } catch (error) {
        console.error('Assign task error:', error);
        throw error;
    }
};

/**
 * Complete task (Executor only)
 * @param {number} taskId - Task ID
 * @returns {Promise<object>} Updated task
 */
export const apiCompleteTask = async (taskId) => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Complete task error:', error);
        throw error;
    }
};

/**
 * Close task (Manager only)
 * @param {number} taskId - Task ID
 * @returns {Promise<object>} Updated task
 */
export const apiCloseTask = async (taskId) => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}/close`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Close task error:', error);
        throw error;
    }
};
