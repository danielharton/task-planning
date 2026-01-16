/**
 * Airport Task Planner - Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './layouts/Dashboard';
import Auth from './layouts/Auth';
import { ThemeProvider, createTheme } from '@mui/material';
import "react-toastify/dist/ReactToastify.css";

// Create MUI theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1565c0',
            light: '#1976d2',
            dark: '#0d47a1',
        },
        secondary: {
            main: '#ff9800',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Root application component with routing and theme.
 * @returns {JSX.Element}
 */
const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <Routes>
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/auth/*" element={<Auth />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

root.render(<App />);
