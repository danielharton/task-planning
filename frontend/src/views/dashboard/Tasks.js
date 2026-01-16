/**
 * Tasks View - Task Management
 * Role-based task operations
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { apiGetTasks, apiCreateTask, apiAssignTask, apiCompleteTask, apiCloseTask } from '../../api/tasks';
import { apiGetTeam } from '../../api/team';
import { showSuccessToast, showErrorToast, formatDate, getStatusColor } from '../../utils/utilFunctions';
import { ROLES } from '../../utils/utilConstants';

/**
 * Task management page with role-based actions.
 * @param {object} props - Component props
 * @param {object|null} props.user - Current user
 * @returns {JSX.Element}
 */
const Tasks = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [team, setTeam] = useState([]);
    
    // Dialog states
    const [createOpen, setCreateOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    
    // Form states
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [selectedExecutor, setSelectedExecutor] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    /**
     * Load tasks and team data.
     * @returns {Promise<void>}
     */
    const loadData = async () => {
        try {
            setLoading(true);
            
            const tasksRes = await apiGetTasks();
            if (tasksRes.success) {
                setTasks(tasksRes.data || []);
            }

            if (user?.role === ROLES.MANAGER) {
                const teamRes = await apiGetTeam();
                if (teamRes.success) {
                    setTeam(teamRes.data || []);
                }
            }
        } catch (error) {
            console.error('Load data error:', error);
            showErrorToast('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create a new task as a manager.
     * @returns {Promise<void>}
     */
    const handleCreateTask = async () => {
        if (!newTask.title.trim()) {
            showErrorToast('Title is required');
            return;
        }

        try {
            const res = await apiCreateTask(newTask);
            if (res.success) {
                showSuccessToast('Task created successfully');
                setCreateOpen(false);
                setNewTask({ title: '', description: '' });
                loadData();
            } else {
                showErrorToast(res.message || 'Failed to create task');
            }
        } catch (error) {
            showErrorToast('Failed to create task');
        }
    };

    /**
     * Assign the selected task to an executor.
     * @returns {Promise<void>}
     */
    const handleAssignTask = async () => {
        if (!selectedExecutor) {
            showErrorToast('Please select an executor');
            return;
        }

        try {
            const res = await apiAssignTask(selectedTask.id, selectedExecutor);
            if (res.success) {
                showSuccessToast('Task assigned successfully');
                setAssignOpen(false);
                setSelectedTask(null);
                setSelectedExecutor('');
                loadData();
            } else {
                showErrorToast(res.message || 'Failed to assign task');
            }
        } catch (error) {
            showErrorToast('Failed to assign task');
        }
    };

    /**
     * Mark a task as completed by executor.
     * @param {number} taskId - Task ID
     * @returns {Promise<void>}
     */
    const handleCompleteTask = async (taskId) => {
        try {
            const res = await apiCompleteTask(taskId);
            if (res.success) {
                showSuccessToast('Task marked as completed');
                loadData();
            } else {
                showErrorToast(res.message || 'Failed to complete task');
            }
        } catch (error) {
            showErrorToast('Failed to complete task');
        }
    };

    /**
     * Close a completed task as manager.
     * @param {number} taskId - Task ID
     * @returns {Promise<void>}
     */
    const handleCloseTask = async (taskId) => {
        try {
            const res = await apiCloseTask(taskId);
            if (res.success) {
                showSuccessToast('Task closed successfully');
                loadData();
            } else {
                showErrorToast(res.message || 'Failed to close task');
            }
        } catch (error) {
            showErrorToast('Failed to close task');
        }
    };

    /**
     * Open the assign dialog for a task.
     * @param {object} task - Task object
     */
    const openAssignDialog = (task) => {
        setSelectedTask(task);
        setAssignOpen(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Tasks
                </Typography>
                {user?.role === ROLES.MANAGER && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateOpen(true)}
                    >
                        Create Task
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Assignee</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary" py={4}>
                                        No tasks found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.id}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">{task.title}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                            {task.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={task.status} 
                                            color={getStatusColor(task.status)} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>{task.assignee_name || '-'}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(task.created_at)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {/* Manager actions */}
                                        {user?.role === ROLES.MANAGER && task.status === 'OPEN' && (
                                            <IconButton
                                                color="primary"
                                                onClick={() => openAssignDialog(task)}
                                                title="Assign to executor"
                                            >
                                                <AssignmentIndIcon />
                                            </IconButton>
                                        )}
                                        {user?.role === ROLES.MANAGER && task.status === 'COMPLETED' && (
                                            <IconButton
                                                color="success"
                                                onClick={() => handleCloseTask(task.id)}
                                                title="Close task"
                                            >
                                                <DoneAllIcon />
                                            </IconButton>
                                        )}
                                        
                                        {/* Executor actions */}
                                        {user?.role === ROLES.EXECUTOR && task.status === 'PENDING' && (
                                            <IconButton
                                                color="success"
                                                onClick={() => handleCompleteTask(task.id)}
                                                title="Mark as completed"
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Task Dialog */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        variant="outlined"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateTask} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Assign Task Dialog */}
            <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Task: {selectedTask?.title}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select Executor</InputLabel>
                        <Select
                            value={selectedExecutor}
                            onChange={(e) => setSelectedExecutor(e.target.value)}
                            label="Select Executor"
                        >
                            {team.map((member) => (
                                <MenuItem key={member.id} value={member.id}>
                                    {member.name} ({member.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {team.length === 0 && (
                        <Typography color="text.secondary" sx={{ mt: 2 }}>
                            No team members available. Ask an admin to assign executors to your team.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssignTask} variant="contained" disabled={!selectedExecutor}>
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Tasks;
