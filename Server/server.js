import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors'; // Импортируем cors

const app = express();
const port = 8080;


// Открываем соединение с базой данных SQLite
async function setupDatabase() {
  const db = await open({
    filename: './WorklLine',
    driver: sqlite3.Database
  });

  // Создаем таблицу для заметок с числовым статусом
  await db.exec(`
    CREATE TABLE IF NOT EXISTS WorklLine (
      id TEXT PRIMARY KEY,
      link TEXT,
      size TEXT,
      name TEXT,
      title TEXT,
      value INTEGER
    )
  `);

  return db;
}

// Инициализируем базу данных
const dbPromise = setupDatabase();

app.use(express.json());
app.use(cors());


app.get('/api/WorklLine', async (req, res) => {
  try {
    const db = await dbPromise;
    const WorklLine = await db.all('SELECT * FROM WorklLine');
    res.json(WorklLine); 
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});