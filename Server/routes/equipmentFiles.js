import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { dbPromise } from '../db/index.js';

const router = Router();

// GET Error.json для оборудования
router.get('/:id/Error.json', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const equipment = await db.get('SELECT id, name FROM Equipment WHERE id = ?', [req.params.id]);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const filePath = path.join(process.env.DATA_DIR || 'data', 'equipment', equipment.id, 'Error.json');
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      res.type('json').send(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Error.json not found for this equipment' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// GET Operate.json для оборудования
router.get('/:id/Operate.json', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const equipment = await db.get('SELECT id, name FROM Equipment WHERE id = ?', [req.params.id]);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const filePath = path.join(process.env.DATA_DIR || 'data', 'equipment', equipment.id, 'Operate.json');
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      res.type('json').send(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Operate.json not found for this equipment' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;