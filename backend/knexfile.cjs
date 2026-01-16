/**
 * Knex Configuration for Airport Task Planner
 * Supports development (PostgreSQL) and production environments
 */

require('dotenv').config({ path: './.env' });

module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'airport_tasks'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: './migrations'
        },
        seeds: {
            directory: './seeds',
            loadExtensions: ['.cjs']
        }
    },

    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: './migrations'
        },
        seeds: {
            directory: './seeds',
            loadExtensions: ['.cjs']
        }
    }
};
