const express = require('express');
const { pool, sql } = require('./db');

const router = express.Router();

// Получить все записи
router.get('/items', async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM Items ORDER BY name ASC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Добавить запись
router.post('/items', async (req, res) => {
  const { name, description } = req.body;
  try {
    await pool.request()
      .input('name', sql.VarChar, name)
      .input('description', sql.VarChar, description)
      .query('INSERT INTO Items (name, description) VALUES (@name, @description)');
    res.status(201).send('Item added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Обновить запись
router.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar, name)
      .input('description', sql.VarChar, description)
      .query('UPDATE Items SET name = @name, description = @description WHERE id = @id');
    res.send('Item updated');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Удалить запись
router.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Items WHERE id = @id');
    res.send('Item deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;