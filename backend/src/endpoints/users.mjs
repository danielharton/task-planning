/**
 * User Management Endpoints (Admin only)
 * POST /users - Create new user
 * GET /users - List all users
 * PATCH /users/:id - Update user
 */

import { Router } from "express";
import { authMiddleware, requireRole } from "../utils/middlewares/authMiddleware.mjs";
import { md5Hash, sendJsonResponse } from "../utils/utilFunctions.mjs";
import db from "../utils/database.mjs";

const router = Router();

/**
 * POST /users
 * Create a new user (Admin only)
 */
router.post('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const { name, email, password, role, manager_id } = req.body;

        // Validate required fields
        if (!name || !email || !password || !role) {
            return sendJsonResponse(res, false, 400, "Name, email, password, and role are required", null);
        }

        // Validate role
        const validRoles = ['ADMIN', 'MANAGER', 'EXECUTOR'];
        if (!validRoles.includes(role)) {
            return sendJsonResponse(res, false, 400, "Invalid role. Must be ADMIN, MANAGER, or EXECUTOR", null);
        }

        // Validate manager_id for executors
        if (role === 'EXECUTOR' && !manager_id) {
            return sendJsonResponse(res, false, 400, "Executor must have a manager assigned", null);
        }

        const knex = await db.getKnex();

        // Check if email already exists
        const existingUser = await knex('users').where({ email }).first();
        if (existingUser) {
            return sendJsonResponse(res, false, 400, "Email already exists", null);
        }

        // Validate manager exists if provided
        if (manager_id) {
            const manager = await knex('users').where({ id: manager_id, role: 'MANAGER' }).first();
            if (!manager) {
                return sendJsonResponse(res, false, 400, "Invalid manager ID", null);
            }
        }

        // Create user
        const [newUser] = await knex('users')
            .insert({
                name,
                email,
                password: md5Hash(password),
                role,
                manager_id: role === 'EXECUTOR' ? manager_id : null
            })
            .returning(['id', 'name', 'email', 'role', 'manager_id', 'created_at']);

        return sendJsonResponse(res, true, 201, "User created successfully", newUser);
    } catch (error) {
        console.error("Create user error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * GET /users
 * List all users (Admin only)
 */
router.get('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const knex = await db.getKnex();
        
        const users = await knex('users')
            .select('users.id', 'users.name', 'users.email', 'users.role', 'users.manager_id', 'users.created_at')
            .leftJoin('users as managers', 'users.manager_id', 'managers.id')
            .select('managers.name as manager_name')
            .orderBy('users.id');

        return sendJsonResponse(res, true, 200, "Users retrieved", users);
    } catch (error) {
        console.error("Get users error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * PATCH /users/:id
 * Update user (Admin only)
 */
router.patch('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, manager_id } = req.body;

        const knex = await db.getKnex();

        // Check if user exists
        const user = await knex('users').where({ id }).first();
        if (!user) {
            return sendJsonResponse(res, false, 404, "User not found", null);
        }

        // Build update object
        const updates = {};
        if (name) updates.name = name;
        if (email) {
            // Check if email is taken by another user
            const existingUser = await knex('users').where({ email }).whereNot({ id }).first();
            if (existingUser) {
                return sendJsonResponse(res, false, 400, "Email already exists", null);
            }
            updates.email = email;
        }
        if (password) updates.password = md5Hash(password);
        if (role) {
            const validRoles = ['ADMIN', 'MANAGER', 'EXECUTOR'];
            if (!validRoles.includes(role)) {
                return sendJsonResponse(res, false, 400, "Invalid role", null);
            }
            updates.role = role;
        }
        if (manager_id !== undefined) {
            if (manager_id) {
                const manager = await knex('users').where({ id: manager_id, role: 'MANAGER' }).first();
                if (!manager) {
                    return sendJsonResponse(res, false, 400, "Invalid manager ID", null);
                }
            }
            updates.manager_id = manager_id;
        }

        if (Object.keys(updates).length === 0) {
            return sendJsonResponse(res, false, 400, "No fields to update", null);
        }

        updates.updated_at = new Date();

        await knex('users').where({ id }).update(updates);

        const updatedUser = await knex('users')
            .select('id', 'name', 'email', 'role', 'manager_id', 'updated_at')
            .where({ id })
            .first();

        return sendJsonResponse(res, true, 200, "User updated successfully", updatedUser);
    } catch (error) {
        console.error("Update user error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * GET /users/managers
 * Get list of managers (for assigning to executors)
 */
router.get('/managers', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const knex = await db.getKnex();
        
        const managers = await knex('users')
            .select('id', 'name', 'email')
            .where({ role: 'MANAGER' })
            .orderBy('name');

        return sendJsonResponse(res, true, 200, "Managers retrieved", managers);
    } catch (error) {
        console.error("Get managers error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

export default router;
