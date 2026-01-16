/**
 * History View - Executor's Task History
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    CardContent
} from '@mui/material';
import { apiGetMyHistory } from '../../api/team';
import { showErrorToast, formatDate, getStatusColor } from '../../utils/utilFunctions';

/**
 * Executor history view for own tasks.
 * @param {object} props - Component props
 * @param {object|null} props.user - Current user
 * @returns {JSX.Element}
 */
const History = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ tasks: [], history: [] });

    useEffect(() => {
        loadHistory();
    }, []);

    /**
     * Load executor task history.
     * @returns {Promise<void>}
     */
    const loadHistory = async () => {
        try {
            setLoading(true);
            const res = await apiGetMyHistory();
            if (res.success) {
                setData(res.data || { tasks: [], history: [] });
            } else {
                showErrorToast(res.message || 'Failed to load history');
            }
        } catch (error) {
            console.error('Load history error:', error);
            showErrorToast('Failed to load history');
        } finally {
            setLoading(false);
        }
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
            <Typography variant="h5" fontWeight="bold" mb={3}>
                My Task History
            </Typography>

            {data.tasks.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" textAlign="center" py={4}>
                            No task history yet. Complete some tasks to see them here.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mb: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created By</TableCell>
                                    <TableCell>Last Updated</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.tasks.map((task) => (
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
                                        <TableCell>{task.creator_name || '-'}</TableCell>
                                        <TableCell>{formatDate(task.updated_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {data.history.length > 0 && (
                        <>
                            <Typography variant="h6" mb={2}>
                                Status Changes
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Task ID</TableCell>
                                            <TableCell>From</TableCell>
                                            <TableCell>To</TableCell>
                                            <TableCell>By</TableCell>
                                            <TableCell>Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.history.map((h) => (
                                            <TableRow key={h.id}>
                                                <TableCell>{h.task_id}</TableCell>
                                                <TableCell>
                                                    {h.previous_status ? (
                                                        <Chip label={h.previous_status} size="small" variant="outlined" />
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={h.new_status} 
                                                        color={getStatusColor(h.new_status)} 
                                                        size="small" 
                                                    />
                                                </TableCell>
                                                <TableCell>{h.actor_name}</TableCell>
                                                <TableCell>{formatDate(h.timestamp)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export default History;
