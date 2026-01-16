/**
 * API Routes for Airport Task Planner
 * Mounts all endpoint modules
 */

import { Router } from "express";
import auth from '../endpoints/auth.mjs';
import users from '../endpoints/users.mjs';
import tasks from '../endpoints/tasks.mjs';
import history from '../endpoints/history.mjs';
import team from '../endpoints/team.mjs';
import airports from '../endpoints/airports.mjs';

const router = Router();

// Authentication routes
router.use('/auth', auth);

// User management routes (Admin)
router.use('/users', users);

// Task management routes
router.use('/tasks', tasks);

// History routes (mounted at root for /my/history and /executors/:id/history)
router.use('/', history);

// Team routes
router.use('/team', team);

// Airport weather routes
router.use('/airports', airports);

export default router;
