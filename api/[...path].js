import { connectDatabase } from '../backend/config/db.js';
import { createApp } from '../backend/app.js';

const app = createApp();
let connection;

export default async function handler(req, res) {
  try {
    connection ??= connectDatabase();
    await connection;
    return app(req, res);
  } catch (error) {
    console.error('Vercel database connection failed', error);
    return res.status(503).json({ message: 'Database temporarily unavailable' });
  }
}
