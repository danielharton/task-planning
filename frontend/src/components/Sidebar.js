/**
 * Sidebar Component for Airport Task Planner
 */

import React from 'react';
import { List, ListItemButton, ListItemText, Drawer, Box, ListItemIcon, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { menus } from '../utils/menus';
import { shouldShowMenu } from '../utils/utilFunctions';

/**
 * Sidebar navigation with role-based menus.
 * @param {object} props - Component props
 * @param {boolean} props.open - Drawer open state
 * @param {function} props.onClose - Drawer close handler
 * @param {object|null} props.user - Current user
 * @returns {JSX.Element}
 */
const Sidebar = ({ open, onClose, user }) => {
    const location = useLocation();

    /**
     * Check if a menu path is active.
     * @param {string} path - Route path
     * @returns {boolean}
     */
    const isActive = (path) => location.pathname === path;

    return (
        <Drawer
            variant={open ? 'persistent' : 'temporary'}
            open={open}
            onClose={onClose}
            sx={{
                width: 260,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 260,
                    boxSizing: 'border-box',
                    top: 64,
                    height: 'calc(100% - 64px)',
                    borderRight: '1px solid #e0e0e0'
                },
            }}
            anchor="left"
        >
            <Box sx={{ p: 2 }}>
                {/* Logo */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <FlightTakeoffIcon sx={{ color: '#1565c0', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold" color="#1565c0">
                        ATP
                    </Typography>
                </Box>

                {/* Menu Items */}
                <List>
                    {menus.map(menu => {
                        if (!shouldShowMenu(user, menu)) return null;

                        return (
                            <ListItemButton
                                key={`menu_${menu.id}`}
                                component={Link}
                                to={menu.to}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    bgcolor: isActive(menu.to) ? '#e3f2fd' : 'transparent',
                                    '&:hover': {
                                        bgcolor: isActive(menu.to) ? '#e3f2fd' : '#f5f5f5'
                                    }
                                }}
                            >
                                {menu.icon && (
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <menu.icon 
                                            sx={{ 
                                                color: isActive(menu.to) ? '#1565c0' : 'inherit' 
                                            }} 
                                        />
                                    </ListItemIcon>
                                )}
                                <ListItemText 
                                    primary={menu.name}
                                    primaryTypographyProps={{
                                        fontWeight: isActive(menu.to) ? 600 : 400,
                                        color: isActive(menu.to) ? '#1565c0' : 'inherit'
                                    }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
