import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

const app = express();
const port = 8080;

// Инициализация базы данных
async function setupDatabase() {
  const db = await open({
    filename: './WorklLine.db',
    driver: sqlite3.Database
  });

  // Создаем таблицу с новой структурой
  await db.exec(`
    CREATE TABLE IF NOT EXISTS WorklLine (
      id TEXT PRIMARY KEY,
      link TEXT NOT NULL,
      size TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      value INTEGER NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Попробуем добавить колонки если их нет (для существующих БД)
  try {
    await db.exec('ALTER TABLE WorklLine ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await db.exec('ALTER TABLE WorklLine ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  } catch (e) {
    console.log('Columns already exist or could not be added');
  }

  // Триггер для обновления времени
  await db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_WorklLine_timestamp
    AFTER UPDATE ON WorklLine
    FOR EACH ROW
    BEGIN
      UPDATE WorklLine SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  // Проверяем, есть ли данные
  const count = await db.get('SELECT COUNT(*) as count FROM WorklLine');
  if (count.count === 0) {
    console.log('Добавляем начальные данные...');
    await db.exec(`
      INSERT INTO WorklLine (id, link, size, name, title, value)
      VALUES 
        ('e133415', '/Statistics', 'element-card', 'CM 421', 'CM 421', 1200),
        ('e133416', '/Statistics', 'element-card-wide', 'Test', 'Другое оборудование', 800),
        ('e133417', '/Statistics', 'element-card', 'CM 421', 'CM 421', 900),
        ('e133418', '/Statistics', 'element-card', 'CM 421', 'CM 421', 1100),
        ('e133419', '/Statistics', 'element-card', 'Test', 'Другое оборудование', 1300)
    `);
  }

  return db;
}

const dbPromise = setupDatabase();

app.use(express.json());
app.use(cors());

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
app.get('/api/equipment', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// GET одно оборудование по ID
app.get('/api/equipment/:id', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// POST добавить новое оборудование
app.post('/api/equipment', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// PUT обновить оборудование
app.put('/api/equipment/:id', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// DELETE удалить оборудование
app.delete('/api/equipment/:id', async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

// Обработка несуществующих роутов
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});