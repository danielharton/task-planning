/**
 * Login Page for Airport Task Planner
 */

import {
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Container,
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { storeToken, storeUser, showSuccessToast, showErrorToast } from '../utils/utilFunctions';
import { useNavigate } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { apiLogin } from '../api/auth';

/**
 * Login page for user authentication.
 * @returns {JSX.Element}
 */
const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });

    /**
     * Validate email and password fields.
     * @returns {boolean}
     */
    const validateForm = () => {
        let valid = true;
        let newErrors = { email: '', password: '' };

        if (!email) {
            newErrors.email = 'Email is required';
            valid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    /**
     * Submit login request and store auth data.
     * @returns {Promise<void>}
     */
    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const data = await apiLogin(email, password);

            if (data.success) {
                const { user, token } = data.data;
                storeToken(token);
                storeUser(user);
                showSuccessToast('Welcome to Airport Task Planner!');
                navigate('/dashboard');
            } else {
                showErrorToast(data.message || 'Invalid credentials');
                setErrors({ email: 'Invalid credentials', password: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Login error:', error);
            showErrorToast('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Submit login on Enter key.
     * @param {KeyboardEvent} e - Key press event
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <FlightTakeoffIcon sx={{ fontSize: 60, color: '#1565c0', mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                            Airport Task Planner
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to manage airport operations
                        </Typography>
                    </Box>

                    <Box component="form" noValidate onKeyDown={handleKeyPress}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                            autoComplete="email"
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Password"
                            variant="outlined"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                            autoComplete="current-password"
                        />

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleLogin}
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                bgcolor: '#1565c0',
                                '&:hover': { bgcolor: '#0d47a1' }
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #eee' }}>
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                            Default accounts for testing:
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                            admin@airport.local / Admin123!
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                            manager@airport.local / Manager123!
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                            exec@airport.local / Exec123!
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
