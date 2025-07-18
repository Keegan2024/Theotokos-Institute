const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'theotokos_institute',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await pool.query(
      'INSERT INTO contacts (name, email, message, created_at) VALUES ($1, $2, $3, $4)',
      [name, email, message, new Date()]
    );
    res.status(201).json({ message: 'Contact message submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
