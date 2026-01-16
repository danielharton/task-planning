/**
 * Authentication Middleware for Airport Task Planner
 * Verifies JWT tokens and attaches user to request
 */

import jwt from 'jsonwebtoken';
import databaseManager from '../database.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'airport-task-planner-secret';

/**
 * Basic authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            data: null
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const knex = await databaseManager.getKnex();
        const user = await knex('users').where({ id: userId }).first();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            data: null
        });
    }
};

/**
 * Role-based authorization middleware factory
 * @param {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                data: null
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
                data: null
            });
        }

        next();
    };
};

// Keep old export for backward compatibility
export const userAuthMiddleware = authMiddleware;
