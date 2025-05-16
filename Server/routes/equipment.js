import { Router } from 'express';
import { dbPromise } from '../db/index.js';

const router = Router();

function validateEquipment(data) {
  const errors = [];
  if (!data.id) errors.push('id is required');
  if (!data.link) errors.push('link is required');
  if (!data.size) errors.push('size is required');
  if (!data.name) errors.push('name is required');
  if (!data.title) errors.push('title is required');
  if (data.value === undefined) errors.push('value is required');
  if (typeof data.value !== 'number') errors.push('value must be a number');
  return errors;
}

// GET все оборудование
router.get('/', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const equipment = await db.all('SELECT * FROM Equipment ORDER BY createdAt DESC');
    res.json(equipment);
  } catch (err) {
    next(err);
  }
});

// GET оборудование по ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const equipment = await db.get('SELECT * FROM Equipment WHERE id = ?', [req.params.id]);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found' });
    res.json(equipment);
  } catch (err) {
    next(err);
  }
});

// POST новое оборудование
router.post('/', async (req, res, next) => {
  try {
    const errors = validateEquipment(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });

    const db = await dbPromise;
    const existing = await db.get('SELECT id FROM Equipment WHERE id = ?', [req.body.id]);
    if (existing) return res.status(409).json({ error: 'Equipment already exists' });

    await db.run(
      'INSERT INTO Equipment (id, link, size, name, title, value) VALUES (?, ?, ?, ?, ?, ?)',
      [req.body.id, req.body.link, req.body.size, req.body.name, req.body.title, req.body.value]
    );

    const newItem = await db.get('SELECT * FROM Equipment WHERE id = ?', [req.body.id]);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

// PUT обновить оборудование
router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateEquipment(req.body);
    if (errors.length > 0) return res.status(400).json({ errors });
    if (req.body.id !== req.params.id) return res.status(400).json({ error: 'ID mismatch' });

    const db = await dbPromise;
    const existing = await db.get('SELECT id FROM Equipment WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Equipment not found' });

    await db.run(
      'UPDATE Equipment SET link=?, size=?, name=?, title=?, value=? WHERE id=?',
      [req.body.link, req.body.size, req.body.name, req.body.title, req.body.value, req.params.id]
    );

    const updatedItem = await db.get('SELECT * FROM Equipment WHERE id = ?', [req.params.id]);
    res.json(updatedItem);
  } catch (err) {
    next(err);
  }
});

// DELETE оборудование
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const existing = await db.get('SELECT id FROM Equipment WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Equipment not found' });

    await db.run('DELETE FROM Equipment WHERE id = ?', [req.params.id]);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;



// // GET	/api/equipment	Получить все записи
// // GET	/api/equipment/:id	Получить одну запись по ID
// // POST	/api/equipment	Создать новую запись
// // PUT	/api/equipment/:id	Обновить запись по ID
// // DELETE	/api/equipment/:id	Удалить запись по ID
