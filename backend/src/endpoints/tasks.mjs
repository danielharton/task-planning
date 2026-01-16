/**
 * Task Management Endpoints
 * POST /tasks - Create task (Manager)
 * GET /tasks - Get tasks (role-based)
 * POST /tasks/:id/assign - Assign task (Manager)
 * POST /tasks/:id/complete - Complete task (Executor)
 * POST /tasks/:id/close - Close task (Manager)
 */

import { Router } from "express";
import { authMiddleware, requireRole } from "../utils/middlewares/authMiddleware.mjs";
import { sendJsonResponse } from "../utils/utilFunctions.mjs";
import db from "../utils/database.mjs";

const router = Router();

/**
 * Record task history entry.
 * @param {object} knex - Knex instance
 * @param {number} taskId - Task ID
 * @param {string|null} previousStatus - Previous status
 * @param {string} newStatus - New status
 * @param {number} actorUserId - Acting user ID
 * @returns {Promise<void>}
 */
async function recordHistory(knex, taskId, previousStatus, newStatus, actorUserId) {
    await knex('task_history').insert({
        task_id: taskId,
        previous_status: previousStatus,
        new_status: newStatus,
        actor_user_id: actorUserId
    });
}

/**
 * POST /tasks
 * Create a new task (Manager only)
 */
router.post('/', authMiddleware, requireRole('MANAGER'), async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return sendJsonResponse(res, false, 400, "Title is required", null);
        }

        const knex = await db.getKnex();

        const [task] = await knex('tasks')
            .insert({
                title,
                description: description || null,
                status: 'OPEN',
                created_by_manager_id: req.user.id,
                assigned_to_user_id: null
            })
            .returning('*');

        // Record history
        await recordHistory(knex, task.id, null, 'OPEN', req.user.id);

        return sendJsonResponse(res, true, 201, "Task created successfully", task);
    } catch (error) {
        console.error("Create task error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * GET /tasks
 * Get tasks based on user role:
 * - ADMIN: All tasks
 * - MANAGER: Tasks created by this manager
 * - EXECUTOR: Tasks assigned to this executor
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const knex = await db.getKnex();
        let query = knex('tasks')
            .leftJoin('users as creator', 'tasks.created_by_manager_id', 'creator.id')
            .leftJoin('users as assignee', 'tasks.assigned_to_user_id', 'assignee.id')
            .select(
                'tasks.*',
                'creator.name as creator_name',
                'assignee.name as assignee_name'
            )
            .orderBy('tasks.created_at', 'desc');

        if (req.user.role === 'MANAGER') {
            // Manager sees only their tasks
            query = query.where('tasks.created_by_manager_id', req.user.id);
        } else if (req.user.role === 'EXECUTOR') {
            // Executor sees only assigned tasks
            query = query.where('tasks.assigned_to_user_id', req.user.id);
        }
        // ADMIN sees all tasks

        const tasks = await query;

        return sendJsonResponse(res, true, 200, "Tasks retrieved", tasks);
    } catch (error) {
        console.error("Get tasks error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * POST /tasks/:id/assign
 * Assign task to executor (Manager only)
 * Changes status from OPEN to PENDING
 */
router.post('/:id/assign', authMiddleware, requireRole('MANAGER'), async (req, res) => {
    try {
        const { id } = req.params;
        const { executor_id } = req.body;

        if (!executor_id) {
            return sendJsonResponse(res, false, 400, "Executor ID is required", null);
        }

        const knex = await db.getKnex();

        // Get task
        const task = await knex('tasks').where({ id }).first();
        if (!task) {
            return sendJsonResponse(res, false, 404, "Task not found", null);
        }

        // Verify manager owns this task
        if (task.created_by_manager_id !== req.user.id) {
            return sendJsonResponse(res, false, 403, "You can only assign your own tasks", null);
        }

        // Verify task is in OPEN status
        if (task.status !== 'OPEN') {
            return sendJsonResponse(res, false, 400, "Only OPEN tasks can be assigned", null);
        }

        // Verify executor exists and belongs to this manager
        const executor = await knex('users').where({ id: executor_id, role: 'EXECUTOR' }).first();
        if (!executor) {
            return sendJsonResponse(res, false, 400, "Invalid executor ID", null);
        }

        if (executor.manager_id !== req.user.id) {
            return sendJsonResponse(res, false, 403, "You can only assign tasks to your team members", null);
        }

        // Update task
        await knex('tasks')
            .where({ id })
            .update({
                status: 'PENDING',
                assigned_to_user_id: executor_id,
                updated_at: new Date()
            });

        // Record history
        await recordHistory(knex, task.id, 'OPEN', 'PENDING', req.user.id);

        const updatedTask = await knex('tasks')
            .leftJoin('users as assignee', 'tasks.assigned_to_user_id', 'assignee.id')
            .select('tasks.*', 'assignee.name as assignee_name')
            .where('tasks.id', id)
            .first();

        return sendJsonResponse(res, true, 200, "Task assigned successfully", updatedTask);
    } catch (error) {
        console.error("Assign task error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * POST /tasks/:id/complete
 * Mark task as completed (Executor only)
 * Changes status from PENDING to COMPLETED
 */
router.post('/:id/complete', authMiddleware, requireRole('EXECUTOR'), async (req, res) => {
    try {
        const { id } = req.params;
        const knex = await db.getKnex();

        // Get task
        const task = await knex('tasks').where({ id }).first();
        if (!task) {
            return sendJsonResponse(res, false, 404, "Task not found", null);
        }

        // Verify executor is assigned to this task
        if (task.assigned_to_user_id !== req.user.id) {
            return sendJsonResponse(res, false, 403, "You can only complete tasks assigned to you", null);
        }

        // Verify task is in PENDING status
        if (task.status !== 'PENDING') {
            return sendJsonResponse(res, false, 400, "Only PENDING tasks can be completed", null);
        }

        // Update task
        await knex('tasks')
            .where({ id })
            .update({
                status: 'COMPLETED',
                updated_at: new Date()
            });

        // Record history
        await recordHistory(knex, task.id, 'PENDING', 'COMPLETED', req.user.id);

        const updatedTask = await knex('tasks').where({ id }).first();

        return sendJsonResponse(res, true, 200, "Task marked as completed", updatedTask);
    } catch (error) {
        console.error("Complete task error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * POST /tasks/:id/close
 * Close completed task (Manager only)
 * Changes status from COMPLETED to CLOSED
 */
router.post('/:id/close', authMiddleware, requireRole('MANAGER'), async (req, res) => {
    try {
        const { id } = req.params;
        const knex = await db.getKnex();

        // Get task
        const task = await knex('tasks').where({ id }).first();
        if (!task) {
            return sendJsonResponse(res, false, 404, "Task not found", null);
        }

        // Verify manager owns this task
        if (task.created_by_manager_id !== req.user.id) {
            return sendJsonResponse(res, false, 403, "You can only close your own tasks", null);
        }

        // Verify task is in COMPLETED status
        if (task.status !== 'COMPLETED') {
            return sendJsonResponse(res, false, 400, "Only COMPLETED tasks can be closed", null);
        }

        // Update task
        await knex('tasks')
            .where({ id })
            .update({
                status: 'CLOSED',
                updated_at: new Date()
            });

        // Record history
        await recordHistory(knex, task.id, 'COMPLETED', 'CLOSED', req.user.id);

        const updatedTask = await knex('tasks').where({ id }).first();

        return sendJsonResponse(res, true, 200, "Task closed successfully", updatedTask);
    } catch (error) {
        console.error("Close task error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

export default router;
