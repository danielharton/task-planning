/**
 * Dashboard Layout for Airport Task Planner
 */

import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Box, CssBaseline, Card } from '@mui/material';
import { ToastContainer } from "react-toastify";
import routes from "../routes.js";
import { apiCheckLogin } from "../api/auth.js";

/**
 * Main dashboard layout with navigation and routes.
 * @returns {JSX.Element}
 */
const Dashboard = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        document.body.style.backgroundColor = '#f5f5f5';
        checkLogin();

        if (window.innerWidth >= 900) {
            setSidebarOpen(true);
        }

        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    /**
     * Validate auth and load current user.
     * @returns {Promise<void>}
     */
    const checkLogin = async () => {
        await apiCheckLogin(
            () => navigate('/auth'),
            (userData) => setUser(userData)
        );
    };

    /**
     * Toggle sidebar visibility.
     */
    const handleMenuClick = () => {
        setSidebarOpen(!sidebarOpen);
    };

    /**
     * Build route elements for dashboard views.
     * @param {Array} routes - Route configs
     * @returns {Array<JSX.Element|null>}
     */
    const getRoutes = (routes) => {
        return routes.map((prop, key) => {
            if (prop.layout === "/dashboard") {
                const Component = prop.component;
                return (
                    <Route
                        key={`route_${key}`}
                        path={prop.path}
                        element={<Component user={user} />}
                        exact
                    />
                );
            }
            return null;
        });
    };

    return (
        <>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <CssBaseline />

                {/* Sidebar */}
                <Sidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    user={user}
                />

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: '#f5f5f5',
                        p: 3,
                        mt: 8
                    }}
                >
                    <Navbar user={user} onMenuClick={handleMenuClick} />
                    <Card sx={{ p: 3, minHeight: 'calc(100vh - 150px)' }}>
                        <Routes>
                            {getRoutes(routes)}
                            <Route path="*" element={<Navigate to="/dashboard/index" replace />} />
                        </Routes>
                    </Card>
                </Box>
            </Box>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
};

export default Dashboard;
