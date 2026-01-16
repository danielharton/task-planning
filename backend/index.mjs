/**
 * Airport Task Planner - Express Application
 * Main application setup with middleware and routes
 */

import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import databaseManager from './src/utils/database.mjs';

// Load environment variables
try {
    dotenv.config({ path: './.env' });
} catch (error) {
    console.log('No .env file found, using environment variables');
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Auth-Token']
}));

/**
 * Run database migrations and seeds on startup.
 * @returns {Promise<boolean>} True if initialization succeeds
 */
const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing database...');
        const knex = await databaseManager.getKnex();
        
        // Test connection
        await knex.raw('SELECT 1');
        console.log('✅ Database connection successful');

        // Run migrations
        console.log('🔄 Running migrations...');
        await databaseManager.runMigrations();
        console.log('✅ Migrations completed');

        // Run seeds
        console.log('🌱 Running seeds...');
        await databaseManager.runSeeds();
        console.log('✅ Seeds completed');

        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
};

// Initialize database and load routes
let apiRoutes = null;
try {
    if (!process.env.SKIP_MIGRATIONS) {
        await initializeDatabase();
    } else {
        console.log('⏭️ Skipping database initialization');
    }

    const { default: apiRoute } = await import('./src/routes/apiRoute.mjs');
    apiRoutes = apiRoute;
    console.log('✅ API routes loaded successfully');
} catch (error) {
    console.error('❌ Failed to load routes:', error.message);
}

// Mount API routes
if (apiRoutes) {
    app.use('/', apiRoutes);
    console.log('📡 API endpoints available');
}

/**
 * Health check endpoint handler.
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Airport Task Planner API',
        timestamp: new Date().toISOString()
    });
});

/**
 * Catch-all 404 handler for unmatched routes.
 */
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

export default app;
