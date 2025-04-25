import express from 'express';
import cors from 'cors';
import equipmentRoutes from './routes/equipment.js';
import { dbPromise } from './db/index.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/equipment', equipmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;