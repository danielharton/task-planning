/**
 * Utility Constants for Airport Task Planner
 */

// Role codes for menu visibility
export const ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    EXECUTOR: 'EXECUTOR'
};

// Task status codes
export const TASK_STATUS = {
    OPEN: 'OPEN',
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CLOSED: 'CLOSED'
};

// Status colors for UI
export const STATUS_COLORS = {
    OPEN: '#2196f3',      // Blue
    PENDING: '#ff9800',   // Orange
    COMPLETED: '#4caf50', // Green
    CLOSED: '#9e9e9e'     // Grey
};

// Needs update string for data refresh
export const NEEDS_UPDATE_STRING = {
    user: 'user',
    tasks: 'tasks',
    team: 'team'
};
