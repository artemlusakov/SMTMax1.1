import app from './app.js';
import { dbPromise } from './db/index.js';

const port = 8080;

// Инициализация базы данных перед запуском сервера
dbPromise.then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});