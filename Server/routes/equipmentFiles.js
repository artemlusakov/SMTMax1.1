import { Router } from 'express';
import { dbPromise } from '../db/index.js';

const router = Router();

// POST для загрузки Error.json
router.post('/:id/Error.json', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const errorData = req.body;
    
    // Проверяем существование оборудования
    const equipment = await db.get('SELECT id FROM Equipment WHERE id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Сохраняем данные в базу
    await db.run(
      'INSERT OR REPLACE INTO EquipmentErrors (equipmentId, data) VALUES (?, ?)',
      [id, JSON.stringify(errorData)]
    );
    
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST для загрузки Operate.json
router.post('/:id/Operate.json', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    const operateData = req.body;
    
    const equipment = await db.get('SELECT id FROM Equipment WHERE id = ?', [id]);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    await db.run(
      'INSERT OR REPLACE INTO EquipmentOperate (equipmentId, data) VALUES (?, ?)',
      [id, JSON.stringify(operateData)]
    );
    
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET Error.json
router.get('/:id/Error.json', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    
    const row = await db.get('SELECT data FROM EquipmentErrors WHERE equipmentId = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: 'Error data not found' });
    }
    
    res.type('json').send(row.data);
  } catch (err) {
    next(err);
  }
});

// GET Operate.json
router.get('/:id/Operate.json', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const { id } = req.params;
    
    const row = await db.get('SELECT data FROM EquipmentOperate WHERE equipmentId = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: 'Operate data not found' });
    }
    
    res.type('json').send(row.data);
  } catch (err) {
    next(err);
  }
});

export default router;