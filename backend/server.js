const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'theotokos_institute',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Routes
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/courses', async (req, res) => {
  const { title, description, department } = req.body;
  try {
    await pool.query(
      'INSERT INTO courses (title, description, department) VALUES ($1, $2, $3)',
      [title, description, department]
    );
    res.status(201).json({ message: 'Course added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/enrollments', async (req, res) => {
  const { user_id } = req.query;
  try {
    const result = await pool.query(
      'SELECT c.* FROM courses c JOIN enrollments e ON c.id = e.course_id WHERE e.user_id = $1',
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/apply', upload.single('qualificationFile'), async (req, res) => {
  const { fullName, address, education, school, program, intake, mode, email, phone, source } = req.body;
  const qualificationFile = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    await pool.query(
      'INSERT INTO applications (full_name, address, education, qualification_file, school, program, intake, mode, email, phone, source, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [fullName, address, education, qualificationFile, school, program, intake, mode, email, phone, source, new Date()]
    );
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/applications', async (req, res) => {
  const { email } = req.query;
  try {
    let query = 'SELECT * FROM applications';
    let params = [];
    if (email) {
      query += ' WHERE email = $1';
      params.push(email);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE applications SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
