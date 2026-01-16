/**
 * Airport Weather (METAR) Endpoints
 * GET /airports/metar?icao=LROP - Get METAR for airport
 * GET /airports/lookups - Get lookup history
 */

import { Router } from "express";
import { authMiddleware } from "../utils/middlewares/authMiddleware.mjs";
import { sendJsonResponse } from "../utils/utilFunctions.mjs";
import db from "../utils/database.mjs";

const router = Router();

/**
 * GET /airports/metar?icao=LROP
 * Fetch METAR data from aviationweather.gov and store in history
 */
router.get('/metar', authMiddleware, async (req, res) => {
    try {
        const { icao } = req.query;

        if (!icao) {
            return sendJsonResponse(res, false, 400, "ICAO code is required", null);
        }

        // Validate ICAO code format (4 letters)
        const icaoCode = icao.toUpperCase().trim();
        if (!/^[A-Z]{4}$/.test(icaoCode)) {
            return sendJsonResponse(res, false, 400, "Invalid ICAO code format (must be 4 letters)", null);
        }

        // Fetch METAR from aviationweather.gov
        const metarUrl = `https://aviationweather.gov/api/data/metar?ids=${icaoCode}&format=raw`;
        
        console.log(`🌤️ Fetching METAR for ${icaoCode}...`);
        
        const response = await fetch(metarUrl);
        const rawMetar = await response.text();

        if (!rawMetar || rawMetar.trim() === '') {
            return sendJsonResponse(res, false, 404, `No METAR data found for ${icaoCode}`, null);
        }

        // Parse basic METAR info
        const parsedData = parseMetar(rawMetar.trim());

        const knex = await db.getKnex();

        // Store lookup in database
        const [lookup] = await knex('metar_lookups')
            .insert({
                icao: icaoCode,
                raw_metar: rawMetar.trim(),
                parsed_data: JSON.stringify(parsedData),
                user_id: req.user.id
            })
            .returning('*');

        return sendJsonResponse(res, true, 200, "METAR data retrieved", {
            icao: icaoCode,
            raw: rawMetar.trim(),
            parsed: parsedData,
            lookup_id: lookup.id,
            lookup_time: lookup.lookup_time
        });
    } catch (error) {
        console.error("Get METAR error:", error);
        return sendJsonResponse(res, false, 500, "Failed to fetch METAR data", null);
    }
});

/**
 * GET /airports/lookups
 * Get METAR lookup history for current user
 */
router.get('/lookups', authMiddleware, async (req, res) => {
    try {
        const knex = await db.getKnex();

        const lookups = await knex('metar_lookups')
            .select('*')
            .where({ user_id: req.user.id })
            .orderBy('lookup_time', 'desc')
            .limit(50);

        // Parse JSON data
        const lookupsWithParsedData = lookups.map(lookup => ({
            ...lookup,
            parsed_data: typeof lookup.parsed_data === 'string' 
                ? JSON.parse(lookup.parsed_data) 
                : lookup.parsed_data
        }));

        return sendJsonResponse(res, true, 200, "Lookups retrieved", lookupsWithParsedData);
    } catch (error) {
        console.error("Get lookups error:", error);
        return sendJsonResponse(res, false, 500, "Internal server error", null);
    }
});

/**
 * Parse raw METAR string into structured data.
 * This is a simplified parser for demo purposes.
 * @param {string} rawMetar - Raw METAR text
 * @returns {object} Parsed METAR data
 */
function parseMetar(rawMetar) {
    const parts = rawMetar.split(' ');
    const parsed = {
        station: parts[0] || null,
        time: parts[1] || null,
        wind: null,
        visibility: null,
        conditions: [],
        temperature: null,
        altimeter: null
    };

    for (const part of parts) {
        // Wind (e.g., 27015KT or 27015G25KT)
        if (/^\d{3}\d{2,3}(G\d{2,3})?KT$/.test(part)) {
            parsed.wind = part;
        }
        // Visibility in SM (e.g., 10SM or 1/2SM)
        else if (/^\d+SM$|^\d+\/\d+SM$/.test(part)) {
            parsed.visibility = part;
        }
        // Temperature/Dewpoint (e.g., 15/10 or M02/M05)
        else if (/^M?\d{2}\/M?\d{2}$/.test(part)) {
            parsed.temperature = part;
        }
        // Altimeter (e.g., A3012 or Q1013)
        else if (/^[AQ]\d{4}$/.test(part)) {
            parsed.altimeter = part;
        }
        // Weather conditions (e.g., -RA, +TSRA, BR, FG)
        else if (/^[-+]?(VC)?(MI|PR|BC|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP)?(BR|FG|FU|VA|DU|SA|HZ|PY)?(PO|SQ|FC|SS|DS)?$/.test(part) && part.length >= 2) {
            parsed.conditions.push(part);
        }
        // Cloud layers (e.g., FEW020, SCT050, BKN100, OVC250)
        else if (/^(FEW|SCT|BKN|OVC|VV)\d{3}(CB|TCU)?$/.test(part)) {
            parsed.conditions.push(part);
        }
    }

    return parsed;
}

export default router;
