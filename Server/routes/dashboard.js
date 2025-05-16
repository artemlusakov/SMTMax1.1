import { Router } from 'express';
import { dbPromise } from '../db/index.js';

const router = Router();

function validateDashboard(data) {
  const errors = [];
  if (!data.id) errors.push('id is required');
  if (!data.name) errors.push('name is required');
  if (!data.image) errors.push('image is required');
  if (!data.isWorking) errors.push('isWorking is required');
  if (!data.status) errors.push('status is required');
  if (!data.efficiency) errors.push('efficiency is required');
  if (!data.temperature) errors.push('temperature is required');
  if (!data.output) errors.push('output is required');
  if (!data.errors) errors.push('errors is required');
  return errors;
}

// GET все элементы Dashboard
router.get('/', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const items = await db.all('SELECT * FROM Dashboard ORDER BY createdAt DESC');
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// GET элемент Dashboard по ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const item = await db.get('SELECT * FROM Dashboard WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Dashboard item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST новый элемент Dashboard
router.post('/', async (req, res, next) => {
  try {
    const errors = validateDashboard(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const db = await dbPromise;
    const existing = await db.get('SELECT id FROM Dashboard WHERE id = ?', [req.body.id]);
    if (existing) return res.status(409).json({ error: 'Dashboard item already exists' });

    await db.run(
      `INSERT INTO Dashboard 
      (id, name, image, isWorking, status, efficiency, temperature, output, errors) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.id,
        req.body.name,
        req.body.image,
        req.body.isWorking,
        req.body.status,
        req.body.efficiency,
        req.body.temperature,
        req.body.output,
        req.body.errors
      ]
    );

    const newItem = await db.get('SELECT * FROM Dashboard WHERE id = ?', [req.body.id]);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

// PUT обновить элемент Dashboard
router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateDashboard(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });
    if (req.body.id !== req.params.id) return res.status(400).json({ error: 'ID mismatch' });

    const db = await dbPromise;
    const existing = await db.get('SELECT id FROM Dashboard WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Dashboard item not found' });

    await db.run(
      `UPDATE Dashboard SET 
      name=?, image=?, isWorking=?, status=?, efficiency=?, 
      temperature=?, output=?, errors=? 
      WHERE id=?`,
      [
        req.body.name,
        req.body.image,
        req.body.isWorking,
        req.body.status,
        req.body.efficiency,
        req.body.temperature,
        req.body.output,
        req.body.errors,
        req.params.id
      ]
    );

    const updatedItem = await db.get('SELECT * FROM Dashboard WHERE id = ?', [req.params.id]);
    res.json(updatedItem);
  } catch (err) {
    next(err);
  }
});

// DELETE элемент Dashboard
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const existing = await db.get('SELECT id FROM Dashboard WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Dashboard item not found' });

    await db.run('DELETE FROM Dashboard WHERE id = ?', [req.params.id]);
    res.json({ message: 'Dashboard item deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;

// Доступные эндпоинты:
// GET    /api/dashboard          - Получить все записи
// GET    /api/dashboard/:id      - Получить одну запись по ID
// POST   /api/dashboard          - Создать новую запись
// PUT    /api/dashboard/:id      - Обновить запись по ID
// DELETE /api/dashboard/:id      - Удалить запись по ID