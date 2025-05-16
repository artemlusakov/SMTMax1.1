import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function setupDatabase() {
  try {
    console.log('[1/7] Открытие подключения к базе данных...');
    const db = await open({
      filename: path.resolve('SMTMax.db'), // Абсолютный путь
      driver: sqlite3.Database
    });

    // 1. Таблица Equipment
    console.log('[2/7] Создание таблицы Equipment...');
    await db.exec(`CREATE TABLE IF NOT EXISTS Equipment (
      id TEXT PRIMARY KEY,
      link TEXT NOT NULL,
      size TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      value INTEGER NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Таблица Dashboard
    console.log('[3/7] Создание таблицы Dashboard...');
    await db.exec(`CREATE TABLE IF NOT EXISTS Dashboard (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT NOT NULL,
      isWorking TEXT NOT NULL,
      status TEXT NOT NULL,
      efficiency TEXT NOT NULL,
      temperature TEXT NOT NULL,
      output TEXT NOT NULL,
      errors TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // 3. Триггеры для Equipment
    console.log('[4/7] Создание триггеров для Equipment...');
    await db.exec(`CREATE TRIGGER IF NOT EXISTS update_equipment_timestamp
      AFTER UPDATE ON Equipment
      BEGIN
        UPDATE Equipment SET updatedAt = CURRENT_TIMESTAMP WHERE id = old.id;
      END;`
    );

    // 4. Триггеры для Dashboard
    console.log('[5/7] Создание триггеров для Dashboard...');
    await db.exec(`CREATE TRIGGER IF NOT EXISTS update_dashboard_timestamp
      AFTER UPDATE ON Dashboard
      BEGIN
        UPDATE Dashboard SET updatedAt = CURRENT_TIMESTAMP WHERE id = old.id;
      END;`
    );

    // 5. Начальные данные для Equipment
    console.log('[6/7] Загрузка данных в Equipment...');
    const equipmentCount = await db.get('SELECT COUNT(*) as count FROM Equipment');
    if (equipmentCount.count === 0) {
      await db.exec(`INSERT INTO Equipment (id, link, size, name, title, value)
        VALUES 
       ('e133415', '/Statistics', 'element-card', 'CM 421', 'CM 421', 1200),
        ('e133416', '/Statistics', 'element-card-wide', 'Test', 'Другое оборудование', 800),
        ('e133417', '/Statistics', 'element-card', 'CM 421', 'CM 421', 900),
        ('e133418', '/Statistics', 'element-card', 'CM 421', 'CM 421', 1100),
        ('e133419', '/Statistics', 'element-card', 'Test', 'Другое оборудование', 1300)
    `);
    }

    // 6. Начальные данные для Dashboard
    console.log('[7/7] Загрузка данных в Dashboard...');
    const dashboardCount = await db.get('SELECT COUNT(*) as count FROM Dashboard');
    if (dashboardCount.count === 0) {
      await db.exec(`INSERT INTO Dashboard 
        (id, name, image, isWorking, status, efficiency, temperature, output, errors)
        VALUES 
          ('e133415', 'Линия пайки SMT-1', 'https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg', '0', '1', '90', '245°C', '2000 ед/час', '10'),
          ('e133416', 'Линия пайки SMT-2', 'https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg', '1', '2', '45', '30°C', '0 ед/час', '0'),
          ('e133417', 'Линия пайки SMT-3', 'https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg', '0', '3', '0', '25°C', '0 ед/час', '25'),
          ('e133418', 'Линия пайки SMT-4', 'https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg', '1', '1', '85', '242°C', '1800 ед/час', '3'),
          ('e133419', 'Конвейерная линия', 'https://www.all-smt.com/uploadfile/202412/205c33201275ff8.jpg', '0', '0', '0', '22°C', '0 ед/час', '0')`
      );
    }

    console.log('✅ Настройка базы данных завершена');
    return db;
  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
    throw error;
  }
}
