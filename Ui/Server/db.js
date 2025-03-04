const sql = require('mssql');

const config = {
  user: 'DESKTOP-A2P6PJ9/Zero',
  password: '',
  server: 'DESKTOP-A2P6PJ9', // Например, localhost
  database: 'MyShop',
  options: {
    encrypt: true, // Если используется шифрование
    trustServerCertificate: true, // Для самоподписанных сертификатов
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect.then(() => {
  console.log('Connected to MSSQL');
}).catch((err) => {
  console.error('Database connection failed:', err);
});

module.exports = { pool, sql };