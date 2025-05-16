import express from 'express';
import cors from 'cors';
import equipmentRoutes from './routes/equipment.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/equipment', equipmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;