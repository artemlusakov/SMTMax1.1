const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Инициализация БД
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ machines: [] }));
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Проверка статуса сервера
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Machine Monitor API',
    version: '1.0.0'
  });
});

// CRUD для станков
app.route('/api/machines')
  .get((req, res) => {
    const db = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(db.machines);
  })
  .post((req, res) => {
    const db = JSON.parse(fs.readFileSync(DB_FILE));
    const newMachine = {
      id: req.body.id,
      name: req.body.name || '',
      logPath: req.body.logPath || '',
      createdAt: new Date().toISOString()
    };
    
    if (!newMachine.id) {
      return res.status(400).json({ error: 'Machine ID is required' });
    }
    
    db.machines.push(newMachine);
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    res.status(201).json(newMachine);
  });

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Статус: http://localhost:${PORT}/api/status`);
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});