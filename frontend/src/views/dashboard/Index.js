/**
 * Dashboard Index - Main Dashboard View
 * Shows overview based on user role
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    CircularProgress
} from '@mui/material';
import TaskIcon from '@mui/icons-material/Task';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { apiGetTasks } from '../../api/tasks';
import { apiGetTeam } from '../../api/team';
import { ROLES } from '../../utils/utilConstants';

/**
 * Dashboard overview page for role-based stats.
 * @param {object} props - Component props
 * @param {object|null} props.user - Current user
 * @returns {JSX.Element}
 */
const DashboardIndex = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        pending: 0,
        completed: 0,
        closed: 0,
        teamSize: 0
    });

    useEffect(() => {
        loadStats();
    }, [user]);

    /**
     * Load task and team stats based on role.
     * @returns {Promise<void>}
     */
    const loadStats = async () => {
        try {
            setLoading(true);
            
            // Load tasks
            const tasksRes = await apiGetTasks();
            if (tasksRes.success) {
                const tasks = tasksRes.data || [];
                setStats(prev => ({
                    ...prev,
                    total: tasks.length,
                    open: tasks.filter(t => t.status === 'OPEN').length,
                    pending: tasks.filter(t => t.status === 'PENDING').length,
                    completed: tasks.filter(t => t.status === 'COMPLETED').length,
                    closed: tasks.filter(t => t.status === 'CLOSED').length
                }));
            }

            // Load team for managers
            if (user?.role === ROLES.MANAGER) {
                const teamRes = await apiGetTeam();
                if (teamRes.success) {
                    setStats(prev => ({
                        ...prev,
                        teamSize: (teamRes.data || []).length
                    }));
                }
            }
        } catch (error) {
            console.error('Load stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Small statistic card component.
     * @param {object} props - Card props
     * @returns {JSX.Element}
     */
    const StatCard = ({ title, value, icon, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" color={color}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        bgcolor: `${color}15`, 
                        borderRadius: '50%', 
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Welcome, {user?.name || 'User'}!
                </Typography>
                <Chip 
                    label={user?.role || 'Unknown'} 
                    color={user?.role === ROLES.ADMIN ? 'error' : user?.role === ROLES.MANAGER ? 'primary' : 'success'}
                    size="small"
                />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Tasks"
                        value={stats.total}
                        icon={<TaskIcon sx={{ fontSize: 40, color: '#1976d2' }} />}
                        color="#1976d2"
                    />
                </Grid>

                {user?.role === ROLES.MANAGER && (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Open Tasks"
                                value={stats.open}
                                icon={<TaskIcon sx={{ fontSize: 40, color: '#2196f3' }} />}
                                color="#2196f3"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Awaiting Closure"
                                value={stats.completed}
                                icon={<CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />}
                                color="#4caf50"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Team Members"
                                value={stats.teamSize}
                                icon={<PeopleIcon sx={{ fontSize: 40, color: '#9c27b0' }} />}
                                color="#9c27b0"
                            />
                        </Grid>
                    </>
                )}

                {user?.role === ROLES.EXECUTOR && (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Pending Tasks"
                                value={stats.pending}
                                icon={<PendingIcon sx={{ fontSize: 40, color: '#ff9800' }} />}
                                color="#ff9800"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Completed"
                                value={stats.completed + stats.closed}
                                icon={<CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />}
                                color="#4caf50"
                            />
                        </Grid>
                    </>
                )}

                {user?.role === ROLES.ADMIN && (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Open"
                                value={stats.open}
                                icon={<TaskIcon sx={{ fontSize: 40, color: '#2196f3' }} />}
                                color="#2196f3"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Pending"
                                value={stats.pending}
                                icon={<PendingIcon sx={{ fontSize: 40, color: '#ff9800' }} />}
                                color="#ff9800"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Closed"
                                value={stats.closed}
                                icon={<CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />}
                                color="#4caf50"
                            />
                        </Grid>
                    </>
                )}
            </Grid>

            <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Task Lifecycle
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label="OPEN" color="info" />
                    <Typography>→</Typography>
                    <Chip label="PENDING" color="warning" />
                    <Typography>→</Typography>
                    <Chip label="COMPLETED" color="success" />
                    <Typography>→</Typography>
                    <Chip label="CLOSED" color="default" />
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardIndex;
