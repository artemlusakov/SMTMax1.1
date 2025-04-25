import { setupDatabase } from './setup.js';

const dbPromise = setupDatabase();

export { dbPromise };