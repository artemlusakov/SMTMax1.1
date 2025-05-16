import app from './app.js';
import { dbPromise } from './db/index.js';

const port = process.env.PORT || 8080;

dbPromise
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log('Available routes:');
      console.log(`- GET/POST/PUT/DELETE /api/equipment[/:id]`);
      console.log(`- GET/POST/PUT/DELETE /api/dashboard[/:id]`);
    });
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });