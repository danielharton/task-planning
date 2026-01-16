/**
 * Airport Task Planner - Server Entry Point
 * Starts the Express server on port 4000
 */
import app from './index.mjs';

const port = process.env.PORT || 4000;

/**
 * Start HTTP server and log the listening address.
 */
app.listen(port, '0.0.0.0', () => {
    console.log(`✈️  Airport Task Planner API running on http://localhost:${port}`);
});
