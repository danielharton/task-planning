/**
 * Task History Endpoints
 * GET /my/history - Get executor's own task history
 * GET /executors/:id/history - Get executor's history (Manager only)
 */

import { Router } from "express";
import { authMiddleware, requireRole } from "../utils/middlewares/authMiddleware.mjs";
import { sendJsonResponse } from "../utils/utilFunctions.mjs";
import db from "../utils/database.mjs";

const router = Router();

/**
 * GET /my/history
 * Get current executor's task history
 */
router.get('/my/history', authMiddleware, requireRole('EXECUTOR'), async (req, res) => {
    try {
        const knex = await db.getKnex();

        // Get all tasks that were ever assigned to this executor
        const tasks = await knex('tasks')
            .leftJoin('users as creator', 'tasks.created_by_manager_id', 'creator.id')
            .select(
                'tasks.*',
                'creator.name as creator_name'
            )
            .where('tasks.assigned_to_user_id', req.user.id)
            .orderBy('tasks.updated_at', 'desc');

        // Get history for these tasks
        const taskIds = tasks.map(t => t.id);
        const history = taskIds.length > 0
            ? await knex('task_history')
                .leftJoin('users', 'task_history.actor_user_id', 'users.id')
                .select(
                    'task_history.*',
                    'users.name as actor_name'
                )
                .whereIn('task_history.task_id', taskIds)
                .orderBy('task_history.timestamp', 'desc')
            : [];

        return sendJsonResponse(res, true, 200, "History retrieved", {
            tasks,
            history
        });
    } catch (error) {
        console.error("Get my history error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * GET /executors/:id/history
 * Get specific executor's task history (Manager only, must be their team member)
 */
router.get('/executors/:id/history', authMiddleware, requireRole('MANAGER'), async (req, res) => {
    try {
        const { id } = req.params;
        const knex = await db.getKnex();

        // Verify executor exists and belongs to this manager
        const executor = await knex('users').where({ id, role: 'EXECUTOR' }).first();
        if (!executor) {
            return sendJsonResponse(res, false, 404, "Executor not found", null);
        }

        if (executor.manager_id !== req.user.id) {
            return sendJsonResponse(res, false, 403, "You can only view history for your team members", null);
        }

        // Get all tasks assigned to this executor
        const tasks = await knex('tasks')
            .select('tasks.*')
            .where('tasks.assigned_to_user_id', id)
            .orderBy('tasks.updated_at', 'desc');

        // Get history for these tasks
        const taskIds = tasks.map(t => t.id);
        const history = taskIds.length > 0
            ? await knex('task_history')
                .leftJoin('users', 'task_history.actor_user_id', 'users.id')
                .select(
                    'task_history.*',
                    'users.name as actor_name'
                )
                .whereIn('task_history.task_id', taskIds)
                .orderBy('task_history.timestamp', 'desc')
            : [];

        return sendJsonResponse(res, true, 200, "Executor history retrieved", {
            executor: { id: executor.id, name: executor.name, email: executor.email },
            tasks,
            history
        });
    } catch (error) {
        console.error("Get executor history error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

export default router;
