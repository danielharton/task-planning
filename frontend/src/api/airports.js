/**
 * Airport Weather (METAR) API
 */

import { getToken } from "../utils/utilFunctions";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Get METAR data for airport
 * @param {string} icao - ICAO airport code (e.g., LROP)
 * @returns {Promise<object>} METAR data
 */
export const apiGetMetar = async (icao) => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/airports/metar?icao=${icao}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get METAR error:', error);
        throw error;
    }
};

/**
 * Get METAR lookup history
 * @returns {Promise<object>} Lookup history
 */
export const apiGetLookups = async () => {
    const token = getToken();

    try {
        const response = await fetch(`${API_URL}/airports/lookups`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return await response.json();
    } catch (error) {
        console.error('Get lookups error:', error);
        throw error;
    }
};
