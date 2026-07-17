import { connectDatabase } from '../backend/config/db.js';
import { createApp } from '../backend/app.js';

const app = createApp();

// Start connecting the moment the function boots (cold start), not on first request.
let connection = connectDatabase().catch((err) => {
  console.error('Eager DB connect failed (will retry per-request):', err.message);
  connection = null;
});

export default async function handler(req, res) {
  // Up to 2 attempts per request: survives a failed eager connect or a dropped socket.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      connection ??= connectDatabase();
      await connection;
      return app(req, res);
    } catch (error) {
      connection = null;
      console.error(`DB connection attempt ${attempt} failed:`, error.message);
      if (attempt === 2) {
        return res.status(503).json({ message: 'Database temporarily unavailable' });
      }
    }
  }
}
