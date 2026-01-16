/**
 * Users View - User Management (Admin only)
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { apiGetUsers, apiCreateUser, apiGetManagers } from '../../api/user';
import { showSuccessToast, showErrorToast } from '../../utils/utilFunctions';

/**
 * Admin user management view.
 * @param {object} props - Component props
 * @param {object|null} props.user - Current user
 * @returns {JSX.Element}
 */
const Users = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EXECUTOR',
        manager_id: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    /**
     * Load users and managers for dropdowns.
     * @returns {Promise<void>}
     */
    const loadData = async () => {
        try {
            setLoading(true);
            
            const [usersRes, managersRes] = await Promise.all([
                apiGetUsers(),
                apiGetManagers()
            ]);
            
            if (usersRes.success) {
                setUsers(usersRes.data || []);
            }
            if (managersRes.success) {
                setManagers(managersRes.data || []);
            }
        } catch (error) {
            console.error('Load data error:', error);
            showErrorToast('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create a new user via the API.
     * @returns {Promise<void>}
     */
    const handleCreateUser = async () => {
        if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
            showErrorToast('Name, email, and password are required');
            return;
        }

        if (newUser.role === 'EXECUTOR' && !newUser.manager_id) {
            showErrorToast('Executor must have a manager assigned');
            return;
        }

        try {
            const userData = {
                name: newUser.name,
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                manager_id: newUser.role === 'EXECUTOR' ? newUser.manager_id : null
            };

            const res = await apiCreateUser(userData);
            if (res.success) {
                showSuccessToast('User created successfully');
                setCreateOpen(false);
                setNewUser({ name: '', email: '', password: '', role: 'EXECUTOR', manager_id: '' });
                loadData();
            } else {
                showErrorToast(res.message || 'Failed to create user');
            }
        } catch (error) {
            showErrorToast('Failed to create user');
        }
    };

    /**
     * Resolve chip color by role.
     * @param {string} role - User role
     * @returns {string} MUI color name
     */
    const getRoleColor = (role) => {
        const colors = {
            ADMIN: 'error',
            MANAGER: 'primary',
            EXECUTOR: 'success'
        };
        return colors[role] || 'default';
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
                    User Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateOpen(true)}
                >
                    Add User
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Manager</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography color="text.secondary" py={4}>
                                        No users found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.id}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight="medium">{u.name}</Typography>
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Chip label={u.role} color={getRoleColor(u.role)} size="small" />
                                    </TableCell>
                                    <TableCell>{u.manager_name || '-'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create User Dialog */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        variant="outlined"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value, manager_id: '' })}
                            label="Role"
                        >
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="MANAGER">Manager</MenuItem>
                            <MenuItem value="EXECUTOR">Executor</MenuItem>
                        </Select>
                    </FormControl>
                    {newUser.role === 'EXECUTOR' && (
                        <FormControl fullWidth>
                            <InputLabel>Assign Manager</InputLabel>
                            <Select
                                value={newUser.manager_id}
                                onChange={(e) => setNewUser({ ...newUser, manager_id: e.target.value })}
                                label="Assign Manager"
                            >
                                {managers.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>
                                        {m.name} ({m.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateUser} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
