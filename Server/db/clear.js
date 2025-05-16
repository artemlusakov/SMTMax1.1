import fs from 'fs';
const dbPath = './SMTMax.db';

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Database file deleted successfully');
} else {
  console.log('Database file does not exist, nothing to delete');
}