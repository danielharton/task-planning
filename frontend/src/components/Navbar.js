/**
 * Navbar Component for Airport Task Planner
 */

import React from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Button,
    Chip,
    Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useNavigate } from 'react-router-dom';
import { clearAuth, showSuccessToast } from '../utils/utilFunctions';

/**
 * Top navigation bar with user info and logout.
 * @param {object} props - Component props
 * @param {object|null} props.user - Current user
 * @param {function} props.onMenuClick - Sidebar toggle handler
 * @returns {JSX.Element}
 */
const Navbar = ({ user, onMenuClick }) => {
    const navigate = useNavigate();

    /**
     * Clear auth state and redirect to login.
     */
    const handleLogout = () => {
        clearAuth();
        showSuccessToast('Logged out successfully');
        navigate('/auth/login');
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

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: '#1565c0'
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <FlightTakeoffIcon sx={{ mr: 1 }} />
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    Airport Task Planner
                </Typography>

                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={user.role}
                            color={getRoleColor(user.role)}
                            size="small"
                            sx={{ color: 'white', fontWeight: 'bold' }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'white', color: '#1565c0' }}>
                                {user.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                {user.name}
                            </Typography>
                        </Box>
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                            sx={{ ml: 1 }}
                        >
                            Logout
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
