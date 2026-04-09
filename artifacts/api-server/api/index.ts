/**
 * Vercel serverless entry point.
 * Vercel detects this file and routes all requests through it.
 * The Express app handles all /api/* routes.
 */
import app from "../src/app.js";

export default app;
