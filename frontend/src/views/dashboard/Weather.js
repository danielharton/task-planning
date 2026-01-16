/**
 * Weather View - Airport METAR Lookup
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudIcon from '@mui/icons-material/Cloud';
import AirIcon from '@mui/icons-material/Air';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { apiGetMetar, apiGetLookups } from '../../api/airports';
import { showSuccessToast, showErrorToast, formatDate } from '../../utils/utilFunctions';

/**
 * Airport METAR lookup view.
 * @param {object} props - Component props
 * @param {object|null} props.user - Current user
 * @returns {JSX.Element}
 */
const Weather = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [icao, setIcao] = useState('');
    const [metar, setMetar] = useState(null);
    const [lookups, setLookups] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        loadLookups();
    }, []);

    /**
     * Load recent METAR lookups for the user.
     * @returns {Promise<void>}
     */
    const loadLookups = async () => {
        try {
            setHistoryLoading(true);
            const res = await apiGetLookups();
            if (res.success) {
                setLookups(res.data || []);
            }
        } catch (error) {
            console.error('Load lookups error:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    /**
     * Fetch METAR data for the given ICAO code.
     * @returns {Promise<void>}
     */
    const searchMetar = async () => {
        if (!icao.trim()) {
            setError('Please enter an ICAO code');
            return;
        }

        if (!/^[A-Za-z]{4}$/.test(icao.trim())) {
            setError('ICAO code must be 4 letters (e.g., LROP, KJFK)');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setMetar(null);

            const res = await apiGetMetar(icao.trim().toUpperCase());
            if (res.success) {
                setMetar(res.data);
                showSuccessToast(`METAR data retrieved for ${icao.toUpperCase()}`);
                loadLookups(); // Refresh history
            } else {
                setError(res.message || 'Failed to fetch METAR data');
            }
        } catch (error) {
            console.error('Search METAR error:', error);
            setError('Failed to fetch METAR data');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Submit search on Enter key.
     * @param {KeyboardEvent} e - Key press event
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchMetar();
        }
    };

    /**
     * Prefill the ICAO code and trigger search.
     * @param {string} code - ICAO code
     */
    const quickSearch = (code) => {
        setIcao(code);
        setTimeout(() => {
            document.getElementById('metar-search-btn')?.click();
        }, 100);
    };

    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" mb={1}>
                Airport Weather (METAR)
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Look up real-time weather data from aviationweather.gov
            </Typography>

            {/* Search Box */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            label="ICAO Code"
                            placeholder="e.g., LROP"
                            value={icao}
                            onChange={(e) => setIcao(e.target.value.toUpperCase())}
                            onKeyPress={handleKeyPress}
                            error={!!error}
                            helperText={error || 'Enter 4-letter ICAO airport code'}
                            inputProps={{ maxLength: 4, style: { textTransform: 'uppercase' } }}
                            sx={{ width: 200 }}
                        />
                        <Button
                            id="metar-search-btn"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                            onClick={searchMetar}
                            disabled={loading}
                            sx={{ mt: 1 }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Quick lookup:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label="LROP (Bucharest)" size="small" onClick={() => quickSearch('LROP')} clickable />
                            <Chip label="KJFK (New York)" size="small" onClick={() => quickSearch('KJFK')} clickable />
                            <Chip label="EGLL (London)" size="small" onClick={() => quickSearch('EGLL')} clickable />
                            <Chip label="LFPG (Paris)" size="small" onClick={() => quickSearch('LFPG')} clickable />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* METAR Result */}
            {metar && (
                <Card sx={{ mb: 3, bgcolor: '#e3f2fd' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <CloudIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {metar.icao} - Current Weather
                        </Typography>
                        
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2" fontFamily="monospace">
                                {metar.raw}
                            </Typography>
                        </Alert>

                        <Grid container spacing={2}>
                            {metar.parsed?.wind && (
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                        <AirIcon color="primary" />
                                        <Typography variant="body2" color="text.secondary">Wind</Typography>
                                        <Typography fontWeight="bold">{metar.parsed.wind}</Typography>
                                    </Box>
                                </Grid>
                            )}
                            {metar.parsed?.visibility && (
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                        <VisibilityIcon color="primary" />
                                        <Typography variant="body2" color="text.secondary">Visibility</Typography>
                                        <Typography fontWeight="bold">{metar.parsed.visibility}</Typography>
                                    </Box>
                                </Grid>
                            )}
                            {metar.parsed?.temperature && (
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                        <ThermostatIcon color="primary" />
                                        <Typography variant="body2" color="text.secondary">Temp/Dew</Typography>
                                        <Typography fontWeight="bold">{metar.parsed.temperature}</Typography>
                                    </Box>
                                </Grid>
                            )}
                            {metar.parsed?.altimeter && (
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                        <CloudIcon color="primary" />
                                        <Typography variant="body2" color="text.secondary">Altimeter</Typography>
                                        <Typography fontWeight="bold">{metar.parsed.altimeter}</Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>

                        {metar.parsed?.conditions?.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Conditions:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {metar.parsed.conditions.map((c, i) => (
                                        <Chip key={i} label={c} size="small" />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Lookup History */}
            <Typography variant="h6" mb={2}>
                Recent Lookups
            </Typography>
            
            {historyLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : lookups.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" textAlign="center" py={2}>
                            No lookup history yet
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>ICAO</TableCell>
                                <TableCell>Raw METAR</TableCell>
                                <TableCell>Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {lookups.slice(0, 10).map((lookup) => (
                                <TableRow key={lookup.id}>
                                    <TableCell>
                                        <Chip 
                                            label={lookup.icao} 
                                            size="small" 
                                            color="primary"
                                            onClick={() => quickSearch(lookup.icao)}
                                            clickable
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontFamily="monospace" noWrap sx={{ maxWidth: 400 }}>
                                            {lookup.raw_metar}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{formatDate(lookup.lookup_time)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default Weather;
