import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function setupDatabase() {
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