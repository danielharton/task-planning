/**
 * Team View - Manager's Team (Executors)
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Avatar,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { apiGetTeam, apiGetExecutorHistory } from '../../api/team';
import { showErrorToast, formatDate, getStatusColor } from '../../utils/utilFunctions';

/**
 * Manager team view for executors.
 * @param {object} props - Component props
 * @param {object|null} props.user - Current user
 * @returns {JSX.Element}
 */
const Team = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        loadTeam();
    }, []);

    /**
     * Load manager team members.
     * @returns {Promise<void>}
     */
    const loadTeam = async () => {
        try {
            setLoading(true);
            const res = await apiGetTeam();
            if (res.success) {
                setTeam(res.data || []);
            } else {
                showErrorToast(res.message || 'Failed to load team');
            }
        } catch (error) {
            console.error('Load team error:', error);
            showErrorToast('Failed to load team');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch and display history for a team executor.
     * @param {object} executor - Executor user object
     * @returns {Promise<void>}
     */
    const viewHistory = async (executor) => {
        try {
            setHistoryLoading(true);
            setHistoryOpen(true);
            
            const res = await apiGetExecutorHistory(executor.id);
            if (res.success) {
                setHistoryData(res.data);
            } else {
                showErrorToast(res.message || 'Failed to load history');
            }
        } catch (error) {
            console.error('Load history error:', error);
            showErrorToast('Failed to load history');
        } finally {
            setHistoryLoading(false);
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
                My Team
            </Typography>

            {team.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" textAlign="center" py={4}>
                            No team members yet. Ask an admin to assign executors to you.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {team.map((member) => (
                        <Grid item xs={12} sm={6} md={4} key={member.id}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight="bold">{member.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {member.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Chip 
                                            label={`${member.total_tasks} tasks`} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                        <Chip 
                                            label={`${member.pending_tasks} pending`} 
                                            size="small" 
                                            color="warning"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<HistoryIcon />}
                                        onClick={() => viewHistory(member)}
                                        fullWidth
                                    >
                                        View History
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* History Dialog */}
            <Dialog 
                open={historyOpen} 
                onClose={() => setHistoryOpen(false)} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            Task History: {historyData?.executor?.name}
                        </Typography>
                        <IconButton onClick={() => setHistoryOpen(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {historyLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : historyData?.tasks?.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                            No task history found
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Task</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Updated</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {historyData?.tasks?.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell>
                                                <Typography fontWeight="medium">{task.title}</Typography>
                                                <Typography variant="body2" color="text.secondary">
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
                                            <TableCell>{formatDate(task.updated_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Team;
