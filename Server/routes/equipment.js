import { Router } from 'express';
import { dbPromise } from '../db/index.js';

const router = Router();

// Валидация данных оборудования
function validateEquipment(data) {
  const errors = [];
  
  if (!data.id) errors.push('id is required');
  if (!data.link) errors.push('link is required');
  if (!data.size) errors.push('size is required');
  if (!data.name) errors.push('name is required');
  if (!data.title) errors.push('title is required');
  if (data.value === undefined || data.value === null) errors.push('value is required');
  if (typeof data.value !== 'number') errors.push('value must be a number');
  
  return errors;
}

// GET все оборудование
router.get('/', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const equipment = await db.all(`
      SELECT id, link, size, name, title, value, 
             datetime(createdAt) as createdAt,
             datetime(updatedAt) as updatedAt 
      FROM WorklLine 
      ORDER BY createdAt DESC
    `);
    res.json(equipment);
  } catch (err) {
    next(err);
  }
});

// GET одно оборудование по ID
router.get('/:id', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const equipment = await db.get(`
      SELECT id, link, size, name, title, value,
             datetime(createdAt) as createdAt,
             datetime(updatedAt) as updatedAt
      FROM WorklLine 
      WHERE id = ?
    `, [req.params.id]);
    
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    res.json(equipment);
  } catch (err) {
    next(err);
  }
});

// POST добавить новое оборудование
router.post('/', async (req, res, next) => {
  try {
    const errors = validateEquipment(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = await dbPromise;
    
    // Проверяем, существует ли уже оборудование с таким ID
    const existing = await db.get('SELECT id FROM WorklLine WHERE id = ?', [req.body.id]);
    if (existing) {
      return res.status(409).json({ error: 'Equipment with this ID already exists' });
    }

    await db.run(
      'INSERT INTO WorklLine (id, link, size, name, title, value) VALUES (?, ?, ?, ?, ?, ?)',
      [req.body.id, req.body.link, req.body.size, req.body.name, req.body.title, req.body.value]
    );
    
    const newEquipment = await db.get(`
      SELECT id, link, size, name, title, value,
             datetime(createdAt) as createdAt,
             datetime(updatedAt) as updatedAt
      FROM WorklLine 
      WHERE id = ?
    `, [req.body.id]);
    
    res.status(201).json(newEquipment);
  } catch (err) {
    next(err);
  }
});

// PUT обновить оборудование
router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateEquipment(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (req.body.id !== req.params.id) {
      return res.status(400).json({ error: 'ID in body and path do not match' });
    }

    const db = await dbPromise;
    
    // Проверяем, существует ли оборудование
    const existing = await db.get('SELECT id FROM WorklLine WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await db.run(
      'UPDATE WorklLine SET link = ?, size = ?, name = ?, title = ?, value = ? WHERE id = ?',
      [req.body.link, req.body.size, req.body.name, req.body.title, req.body.value, req.params.id]
    );
    
    const updatedEquipment = await db.get(`
      SELECT id, link, size, name, title, value,
             datetime(createdAt) as createdAt,
             datetime(updatedAt) as updatedAt
      FROM WorklLine 
      WHERE id = ?
    `, [req.params.id]);
    
    res.json(updatedEquipment);
  } catch (err) {
    next(err);
  }
});

// DELETE удалить оборудование
router.delete('/:id', async (req, res, next) => {
  try {
    const db = await dbPromise;
    
    // Проверяем, существует ли оборудование
    const existing = await db.get('SELECT id FROM WorklLine WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await db.run('DELETE FROM WorklLine WHERE id = ?', [req.params.id]);
    
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
