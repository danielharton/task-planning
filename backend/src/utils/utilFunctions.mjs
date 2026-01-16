/**
 * Utility Functions for Airport Task Planner
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'airport-task-planner-secret';

/**
 * Generate JWT authentication token
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @param {string} expire - Token expiration time
 * @returns {string} JWT token
 */
export function getAuthToken(userId, role, expire = '1d') {
    return jwt.sign(
        { id: userId, role: role },
        JWT_SECRET,
        { expiresIn: expire }
    );
}

/**
 * Hash password using MD5 (password + password)
 * @param {string} password - Plain text password
 * @returns {string} MD5 hashed password
 */
export function md5Hash(password) {
    return crypto.createHash('md5').update(password + password).digest('hex');
}

/**
 * Send standardized JSON response
 * @param {Response} res - Express response object
 * @param {boolean} success - Success status
 * @param {number} status - HTTP status code
 * @param {string} message - Response message
 * @param {any} data - Response data
 */
export function sendJsonResponse(res, success, status, message, data) {
    res.status(status).json({
        success,
        message,
        data
    });
}
