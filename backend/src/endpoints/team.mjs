/**
 * Team Management Endpoints
 * GET /team - Get manager's team members (executors)
 */

import { Router } from "express";
import { authMiddleware, requireRole } from "../utils/middlewares/authMiddleware.mjs";
import { sendJsonResponse } from "../utils/utilFunctions.mjs";
import db from "../utils/database.mjs";

const router = Router();

/**
 * GET /team
 * Get all executors assigned to the current manager
 */
router.get('/', authMiddleware, requireRole('MANAGER'), async (req, res) => {
    try {
        const knex = await db.getKnex();

        const executors = await knex('users')
            .select('id', 'name', 'email', 'created_at')
            .where({ manager_id: req.user.id, role: 'EXECUTOR' })
            .orderBy('name');

        // Get task counts for each executor
        const executorIds = executors.map(e => e.id);
        const taskCounts = executorIds.length > 0
            ? await knex('tasks')
                .select('assigned_to_user_id')
                .count('* as total')
                .whereIn('assigned_to_user_id', executorIds)
                .groupBy('assigned_to_user_id')
            : [];

        // Get pending task counts
        const pendingCounts = executorIds.length > 0
            ? await knex('tasks')
                .select('assigned_to_user_id')
                .count('* as pending')
                .whereIn('assigned_to_user_id', executorIds)
                .where('status', 'PENDING')
                .groupBy('assigned_to_user_id')
            : [];

        // Merge counts with executors
        const executorsWithCounts = executors.map(executor => {
            const totalCount = taskCounts.find(tc => tc.assigned_to_user_id === executor.id);
            const pendingCount = pendingCounts.find(pc => pc.assigned_to_user_id === executor.id);
            return {
                ...executor,
                total_tasks: totalCount ? parseInt(totalCount.total) : 0,
                pending_tasks: pendingCount ? parseInt(pendingCount.pending) : 0
            };
        });

        return sendJsonResponse(res, true, 200, "Team retrieved", executorsWithCounts);
    } catch (error) {
        console.error("Get team error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

export default router;
