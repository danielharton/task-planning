/**
 * Authentication Endpoints
 * POST /auth/login - User login
 * GET /auth/me - Get current user
 */

import { Router } from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware.mjs";
import { getAuthToken, md5Hash, sendJsonResponse } from "../utils/utilFunctions.mjs";
import db from "../utils/database.mjs";

const router = Router();

/**
 * POST /auth/login
 * Authenticate user with email and password
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return sendJsonResponse(res, false, 400, "Email and password are required", null);
        }

        const knex = await db.getKnex();
        const user = await knex('users').where({ email }).first();

        if (!user) {
            return sendJsonResponse(res, false, 401, "Invalid credentials", null);
        }

        const hashedPassword = md5Hash(password);
        if (hashedPassword !== user.password) {
            return sendJsonResponse(res, false, 401, "Invalid credentials", null);
        }

        // Generate JWT token
        const token = getAuthToken(user.id, user.role, '1d');

        // Update last login
        await knex('users')
            .where({ id: user.id })
            .update({ last_login: Math.floor(Date.now() / 1000) });

        // Set auth header
        res.set('X-Auth-Token', token);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return sendJsonResponse(res, true, 200, "Successfully logged in!", {
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error("Login error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * GET /auth/me
 * Get current authenticated user info
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { password: _, ...userWithoutPassword } = req.user;
        
        // If executor, also get manager info
        let manager = null;
        if (req.user.role === 'EXECUTOR' && req.user.manager_id) {
            const knex = await db.getKnex();
            manager = await knex('users')
                .select('id', 'name', 'email')
                .where({ id: req.user.manager_id })
                .first();
        }

        return sendJsonResponse(res, true, 200, "User retrieved", {
            ...userWithoutPassword,
            manager
        });
    } catch (error) {
        console.error("Get me error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

export default router;
