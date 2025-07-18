-- Creating database for Theotokos Institute Zambia
CREATE DATABASE theotokos_institute;

-- Connect to the database
\c theotokos_institute;

-- Users table (students and admins)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) CHECK (role IN ('student', 'admin')) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Materials table
CREATE TABLE course_materials (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50 | CHECK (type IN ('video', 'pdf', 'assignment')),
  url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments table (links users to courses)
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table (for contact form submissions)
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table (for student applications)
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  education VARCHAR(100) NOT NULL,
  qualification_file VARCHAR(255),
  school VARCHAR(100) NOT NULL,
  program VARCHAR(255) NOT NULL,
  intake VARCHAR(50) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  source VARCHAR(100) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for testing
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('student1@example.com', '$2b$10$examplehashedpassword', 'John', 'Doe', 'student'),
       ('admin@example.com', '$2b$10$examplehashedpassword', 'Jane', 'Smith', 'admin');

INSERT INTO courses (title, description, department)
VALUES ('Business Administration 101', 'Introduction to management and strategy', 'Business'),
       ('Introduction to Computer Science', 'Basics of programming and AI', 'Computer Science'),
       ('Philosophy 101', 'Explore critical thinking and ethics', 'Liberal Arts');

INSERT INTO course_materials (course_id, title, type, url)
VALUES (1, 'Introduction Lecture', 'video', 'https://example.com/videos/business101.mp4'),
       (1, 'Course Syllabus', 'pdf', 'https://example.com/pdfs/business101.pdf'),
       (2, 'Coding Assignment 1', 'assignment', 'https://example.com/assignments/cs101.pdf');

INSERT INTO enrollments (user_id, course_id)
VALUES (1, 1), (1, 2);

INSERT INTO events (title, description, event_date, location, is_online)
VALUES ('Virtual Orientation', 'Welcome to new students', '2025-08-10 10:00:00', 'Zoom', TRUE),
       ('Career Workshop', 'Online career guidance', '2025-09-20 14:00:00', 'Online', TRUE);
