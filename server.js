import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import path from 'path';
import fs from 'fs';
import http from 'http';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
app.use(express.json());

app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, "dist")));
}


let db;

// MongoDB Connection
const connectDB = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('aonetarget');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize DB on startup
connectDB();

// Routes for Courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.collection('courses').find({}).toArray();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const result = await db.collection('courses').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const { ObjectId } = await import('mongodb');
    const course = await db.collection('courses').findOne({ id: req.params.id });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Routes for Instructors
app.get('/api/instructors', async (req, res) => {
  try {
    const instructors = await db.collection('instructors').find({}).toArray();
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
});

// Routes for Curriculum
app.get('/api/curriculum', async (req, res) => {
  try {
    const curriculum = await db.collection('curriculum').find({}).toArray();
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch curriculum' });
  }
});

app.get('/api/curriculum/:courseId', async (req, res) => {
  try {
    const curriculum = await db.collection('curriculum').find({ courseId: req.params.courseId }).toArray();
    res.json(curriculum);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch curriculum' });
  }
});

// Routes for Students/Users
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const result = await db.collection('users').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Routes for Students
app.get('/api/students', async (req, res) => {
  try {
    const students = await db.collection('students').find({}).toArray();
    console.log('GET /api/students - Found', students.length, 'students');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await db.collection('students').findOne({ id: req.params.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    console.log('POST /api/students - Received student data:', req.body);
    const result = await db.collection('students').insertOne(req.body);
    console.log('Student created successfully with ID:', result.insertedId);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student', details: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    console.log('PUT /api/students/:id - Updating student:', req.params.id, req.body);
    const { ObjectId } = await import('mongodb');
    const result = await db.collection('students').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      console.warn('Student not found:', req.params.id);
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('Student updated successfully:', req.params.id);
    res.json({ success: true, message: 'Student updated' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student', details: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    console.log('DELETE /api/students/:id - Deleting student:', req.params.id);
    const result = await db.collection('students').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      console.warn('Student not found for deletion:', req.params.id);
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log('Student deleted successfully:', req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student', details: error.message });
  }
});

// Routes for Orders/Payments
app.post('/api/orders', async (req, res) => {
  try {
    const order = {
      ...req.body,
      createdAt: new Date(),
      status: 'pending'
    };
    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ _id: result.insertedId, ...order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const orders = await db.collection('orders').find({ userId: req.params.userId }).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Routes for Buyers
app.get('/api/buyers', async (req, res) => {
  try {
    const buyers = await db.collection('buyers').find({}).toArray();
    res.json(buyers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

app.post('/api/buyers', async (req, res) => {
  try {
    const result = await db.collection('buyers').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create buyer' });
  }
});

app.put('/api/buyers/:id', async (req, res) => {
  try {
    const result = await db.collection('buyers').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.json({ success: true, message: 'Buyer updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update buyer' });
  }
});

app.delete('/api/buyers/:id', async (req, res) => {
  try {
    const result = await db.collection('buyers').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    res.json({ success: true, message: 'Buyer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete buyer' });
  }
});

// Routes for Tokens
app.get('/api/tokens', async (req, res) => {
  try {
    const tokens = await db.collection('tokens').find({}).toArray();
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

app.post('/api/tokens', async (req, res) => {
  try {
    const result = await db.collection('tokens').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create token' });
  }
});

app.put('/api/tokens/:id', async (req, res) => {
  try {
    const result = await db.collection('tokens').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }
    res.json({ success: true, message: 'Token updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update token' });
  }
});

app.delete('/api/tokens/:id', async (req, res) => {
  try {
    const result = await db.collection('tokens').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }
    res.json({ success: true, message: 'Token deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete token' });
  }
});

// Routes for Coupons
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await db.collection('coupons').find({}).toArray();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const result = await db.collection('coupons').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

app.put('/api/coupons/:id', async (req, res) => {
  try {
    const result = await db.collection('coupons').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

app.delete('/api/coupons/:id', async (req, res) => {
  try {
    const result = await db.collection('coupons').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// Admin Authentication Routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ error: 'Admin ID and password are required' });
    }

    const admin = await db.collection('admins').findOne({ adminId });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid Admin ID or Password' });
    }

    // Simple password comparison (in production, use bcrypt)
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid Admin ID or Password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      adminId: admin.adminId,
      name: admin.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/admin/verify', async (req, res) => {
  try {
    const adminId = req.headers['x-admin-id'];

    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const admin = await db.collection('admins').findOne({ adminId });

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    res.json({
      success: true,
      adminId: admin.adminId,
      name: admin.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Routes for Store/Products
app.get('/api/store', async (req, res) => {
  try {
    const products = await db.collection('store').find({}).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch store products' });
  }
});

app.post('/api/store', async (req, res) => {
  try {
    const result = await db.collection('store').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/store/:id', async (req, res) => {
  try {
    const result = await db.collection('store').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/store/:id', async (req, res) => {
  try {
    const result = await db.collection('store').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Routes for Institute Settings
app.get('/api/institute', async (req, res) => {
  try {
    const settings = await db.collection('institute').findOne({});
    res.json(settings || { name: '', email: '', phone: '', address: '', logo: '' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch institute settings' });
  }
});

app.put('/api/institute', async (req, res) => {
  try {
    const result = await db.collection('institute').updateOne(
      {},
      { $set: req.body },
      { upsert: true }
    );
    res.json({ success: true, message: 'Institute settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update institute settings' });
  }
});

// Routes for Questions
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await db.collection('questions').find({}).toArray();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const result = await db.collection('questions').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

app.put('/api/questions/:id', async (req, res) => {
  try {
    const result = await db.collection('questions').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true, message: 'Question updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const result = await db.collection('questions').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Routes for Tests
app.get('/api/tests', async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = courseId ? { courseId } : {};
    const tests = await db.collection('tests').find(query).toArray();
    console.log('GET /api/tests - Found', tests.length, 'tests');
    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// Get tests by course
app.get('/api/courses/:courseId/tests', async (req, res) => {
  try {
    const tests = await db.collection('tests').find({ courseId: req.params.courseId }).toArray();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course tests' });
  }
});

app.post('/api/tests', async (req, res) => {
  try {
    console.log('POST /api/tests - Received test data:', req.body);
    const result = await db.collection('tests').insertOne(req.body);
    console.log('Test created successfully with ID:', result.insertedId);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test', details: error.message });
  }
});

app.put('/api/tests/:id', async (req, res) => {
  try {
    console.log('PUT /api/tests/:id - Updating test:', req.params.id, req.body);
    const result = await db.collection('tests').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Test not found' });
    console.log('Test updated successfully:', req.params.id);
    res.json({ success: true, message: 'Test updated' });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test', details: error.message });
  }
});

app.delete('/api/tests/:id', async (req, res) => {
  try {
    console.log('DELETE /api/tests/:id - Deleting test:', req.params.id);
    const result = await db.collection('tests').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Test not found' });
    console.log('Test deleted successfully:', req.params.id);
    res.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test', details: error.message });
  }
});

// Routes for Test Series
app.get('/api/test-series', async (req, res) => {
  try {
    const series = await db.collection('testSeries').find({}).toArray();
    console.log('GET /api/test-series - Found', series.length, 'series');
    res.json(series);
  } catch (error) {
    console.error('Error fetching test series:', error);
    res.status(500).json({ error: 'Failed to fetch test series' });
  }
});

app.post('/api/test-series', async (req, res) => {
  try {
    console.log('POST /api/test-series - Received series data:', req.body);
    const result = await db.collection('testSeries').insertOne(req.body);
    console.log('Series created successfully with ID:', result.insertedId);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error creating test series:', error);
    res.status(500).json({ error: 'Failed to create test series', details: error.message });
  }
});

app.put('/api/test-series/:id', async (req, res) => {
  try {
    console.log('PUT /api/test-series/:id - Updating series:', req.params.id, req.body);
    const result = await db.collection('testSeries').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Series not found' });
    console.log('Series updated successfully:', req.params.id);
    res.json({ success: true, message: 'Series updated' });
  } catch (error) {
    console.error('Error updating test series:', error);
    res.status(500).json({ error: 'Failed to update test series', details: error.message });
  }
});

app.delete('/api/test-series/:id', async (req, res) => {
  try {
    console.log('DELETE /api/test-series/:id - Deleting series:', req.params.id);
    const result = await db.collection('testSeries').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Series not found' });
    console.log('Series deleted successfully:', req.params.id);
    res.json({ success: true, message: 'Series deleted' });
  } catch (error) {
    console.error('Error deleting test series:', error);
    res.status(500).json({ error: 'Failed to delete test series', details: error.message });
  }
});

// Routes for Subjective Tests
app.get('/api/subjective-tests', async (req, res) => {
  try {
    const tests = await db.collection('subjectiveTests').find({}).toArray();
    console.log('GET /api/subjective-tests - Found', tests.length, 'tests');
    res.json(tests);
  } catch (error) {
    console.error('Error fetching subjective tests:', error);
    res.status(500).json({ error: 'Failed to fetch subjective tests' });
  }
});

app.post('/api/subjective-tests', async (req, res) => {
  try {
    console.log('POST /api/subjective-tests - Received test data:', req.body);
    const result = await db.collection('subjectiveTests').insertOne(req.body);
    console.log('Subjective test created successfully with ID:', result.insertedId);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error creating subjective test:', error);
    res.status(500).json({ error: 'Failed to create subjective test', details: error.message });
  }
});

app.put('/api/subjective-tests/:id', async (req, res) => {
  try {
    console.log('PUT /api/subjective-tests/:id - Updating test:', req.params.id, req.body);
    const result = await db.collection('subjectiveTests').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Test not found' });
    console.log('Subjective test updated successfully:', req.params.id);
    res.json({ success: true, message: 'Test updated' });
  } catch (error) {
    console.error('Error updating subjective test:', error);
    res.status(500).json({ error: 'Failed to update subjective test', details: error.message });
  }
});

app.delete('/api/subjective-tests/:id', async (req, res) => {
  try {
    console.log('DELETE /api/subjective-tests/:id - Deleting test:', req.params.id);
    const result = await db.collection('subjectiveTests').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Test not found' });
    console.log('Subjective test deleted successfully:', req.params.id);
    res.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    console.error('Error deleting subjective test:', error);
    res.status(500).json({ error: 'Failed to delete subjective test', details: error.message });
  }
});

// Routes for Videos
app.get('/api/videos', async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = courseId ? { courseId } : {};
    const videos = await db.collection('videos').find(query).toArray();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get videos by course
app.get('/api/courses/:courseId/videos', async (req, res) => {
  try {
    const videos = await db.collection('videos').find({ courseId: req.params.courseId }).sort({ order: 1 }).toArray();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course videos' });
  }
});

// Add video to course
app.post('/api/courses/:courseId/videos', async (req, res) => {
  try {
    const videoData = { ...req.body, courseId: req.params.courseId };
    const result = await db.collection('videos').insertOne(videoData);
    res.status(201).json({ _id: result.insertedId, ...videoData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add video to course' });
  }
});

// Update video in course
app.put('/api/courses/:courseId/videos/:videoId', async (req, res) => {
  try {
    const result = await db.collection('videos').updateOne(
      { id: req.params.videoId, courseId: req.params.courseId },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Video not found' });
    res.json({ success: true, message: 'Video updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video from course
app.delete('/api/courses/:courseId/videos/:videoId', async (req, res) => {
  try {
    const result = await db.collection('videos').deleteOne({ id: req.params.videoId, courseId: req.params.courseId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Video not found' });
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

app.post('/api/videos', async (req, res) => {
  try {
    const result = await db.collection('videos').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create video' });
  }
});

app.put('/api/videos/:id', async (req, res) => {
  try {
    const result = await db.collection('videos').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Video not found' });
    res.json({ success: true, message: 'Video updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update video' });
  }
});

app.delete('/api/videos/:id', async (req, res) => {
  try {
    const result = await db.collection('videos').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Video not found' });
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Routes for Live Videos/Streams
app.get('/api/live-videos', async (req, res) => {
  try {
    const liveVideos = await db.collection('liveVideos').find({}).toArray();
    res.json(liveVideos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live videos' });
  }
});

app.post('/api/live-videos', async (req, res) => {
  try {
    const result = await db.collection('liveVideos').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create live video' });
  }
});

app.put('/api/live-videos/:id', async (req, res) => {
  try {
    const result = await db.collection('liveVideos').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Live video not found' });
    res.json({ success: true, message: 'Live video updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update live video' });
  }
});

app.delete('/api/live-videos/:id', async (req, res) => {
  try {
    const result = await db.collection('liveVideos').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Live video not found' });
    res.json({ success: true, message: 'Live video deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete live video' });
  }
});

// Routes for PDFs/Notes
app.get('/api/pdfs', async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = courseId ? { courseId } : {};
    const pdfs = await db.collection('pdfs').find(query).toArray();
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
});

// Get notes/PDFs by course
app.get('/api/courses/:courseId/notes', async (req, res) => {
  try {
    const notes = await db.collection('pdfs').find({ courseId: req.params.courseId }).sort({ order: 1 }).toArray();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course notes' });
  }
});

// Add note to course
app.post('/api/courses/:courseId/notes', async (req, res) => {
  try {
    const noteData = { ...req.body, courseId: req.params.courseId };
    const result = await db.collection('pdfs').insertOne(noteData);
    res.status(201).json({ _id: result.insertedId, ...noteData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note to course' });
  }
});

// Update note in course
app.put('/api/courses/:courseId/notes/:noteId', async (req, res) => {
  try {
    const result = await db.collection('pdfs').updateOne(
      { id: req.params.noteId, courseId: req.params.courseId },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true, message: 'Note updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note from course
app.delete('/api/courses/:courseId/notes/:noteId', async (req, res) => {
  try {
    const result = await db.collection('pdfs').deleteOne({ id: req.params.noteId, courseId: req.params.courseId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Get tests by course
app.get('/api/courses/:courseId/tests', async (req, res) => {
  try {
    const tests = await db.collection('tests').find({ courseId: req.params.courseId }).toArray();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course tests' });
  }
});

// Add test to course
app.post('/api/courses/:courseId/tests', async (req, res) => {
  try {
    const testData = { ...req.body, courseId: req.params.courseId };
    const result = await db.collection('tests').insertOne(testData);
    res.status(201).json({ _id: result.insertedId, ...testData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add test to course' });
  }
});

// Update test in course
app.put('/api/courses/:courseId/tests/:testId', async (req, res) => {
  try {
    const result = await db.collection('tests').updateOne(
      { id: req.params.testId, courseId: req.params.courseId },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Test not found' });
    res.json({ success: true, message: 'Test updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// Delete test from course
app.delete('/api/courses/:courseId/tests/:testId', async (req, res) => {
  try {
    const result = await db.collection('tests').deleteOne({ id: req.params.testId, courseId: req.params.courseId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Test not found' });
    res.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

app.post('/api/pdfs', async (req, res) => {
  try {
    const result = await db.collection('pdfs').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create PDF' });
  }
});

app.put('/api/pdfs/:id', async (req, res) => {
  try {
    const result = await db.collection('pdfs').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'PDF not found' });
    res.json({ success: true, message: 'PDF updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update PDF' });
  }
});

app.delete('/api/pdfs/:id', async (req, res) => {
  try {
    const result = await db.collection('pdfs').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'PDF not found' });
    res.json({ success: true, message: 'PDF deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
});

// Routes for Packages/Batches
app.get('/api/packages', async (req, res) => {
  try {
    const packages = await db.collection('packages').find({}).toArray();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

app.post('/api/packages', async (req, res) => {
  try {
    const result = await db.collection('packages').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create package' });
  }
});

app.put('/api/packages/:id', async (req, res) => {
  try {
    const result = await db.collection('packages').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Package not found' });
    res.json({ success: true, message: 'Package updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update package' });
  }
});

app.delete('/api/packages/:id', async (req, res) => {
  try {
    const result = await db.collection('packages').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Package not found' });
    res.json({ success: true, message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

// Routes for Messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await db.collection('messages').find({}).toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const result = await db.collection('messages').insertOne({
      ...req.body,
      createdAt: new Date(),
      read: false
    });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create message' });
  }
});

app.put('/api/messages/:id', async (req, res) => {
  try {
    const result = await db.collection('messages').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true, message: 'Message updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    const result = await db.collection('messages').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Routes for Blog
app.get('/api/blog', async (req, res) => {
  try {
    const posts = await db.collection('blog').find({}).toArray();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

app.post('/api/blog', async (req, res) => {
  try {
    const result = await db.collection('blog').insertOne({
      ...req.body,
      createdAt: new Date(),
      status: req.body.status || 'draft'
    });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

app.put('/api/blog/:id', async (req, res) => {
  try {
    const result = await db.collection('blog').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Blog post not found' });
    res.json({ success: true, message: 'Blog post updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

app.delete('/api/blog/:id', async (req, res) => {
  try {
    const result = await db.collection('blog').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Blog post not found' });
    res.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// Routes for Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.collection('settings').findOne({});
    res.json(settings || { paymentGateway: 'razorpay', systemStatus: 'online', maintenanceMode: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const result = await db.collection('settings').updateOne(
      {},
      { $set: req.body },
      { upsert: true }
    );
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Routes for Banners
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await db.collection('banners').find({}).toArray();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

app.post('/api/banners', async (req, res) => {
  try {
    const result = await db.collection('banners').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

app.put('/api/banners/:id', async (req, res) => {
  try {
    const result = await db.collection('banners').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Banner not found' });
    res.json({ success: true, message: 'Banner updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

app.delete('/api/banners/:id', async (req, res) => {
  try {
    const result = await db.collection('banners').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Banner not found' });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// Routes for Misc items (subjects, topics, subcourses, instructions, news, notifications)
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await db.collection('subjects').find({}).toArray();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const result = await db.collection('subjects').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const result = await db.collection('subjects').updateOne({ id: req.params.id }, { $set: req.body });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json({ success: true, message: 'Subject updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const result = await db.collection('subjects').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

app.get('/api/topics', async (req, res) => {
  try {
    const topics = await db.collection('topics').find({}).toArray();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

app.post('/api/topics', async (req, res) => {
  try {
    const result = await db.collection('topics').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

app.put('/api/topics/:id', async (req, res) => {
  try {
    const result = await db.collection('topics').updateOne({ id: req.params.id }, { $set: req.body });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Topic not found' });
    res.json({ success: true, message: 'Topic updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

app.delete('/api/topics/:id', async (req, res) => {
  try {
    const result = await db.collection('topics').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Topic not found' });
    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

app.get('/api/subcourses', async (req, res) => {
  try {
    const subcourses = await db.collection('subcourses').find({}).toArray();
    res.json(subcourses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subcourses' });
  }
});

app.post('/api/subcourses', async (req, res) => {
  try {
    const result = await db.collection('subcourses').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subcourse' });
  }
});

app.put('/api/subcourses/:id', async (req, res) => {
  try {
    const result = await db.collection('subcourses').updateOne({ id: req.params.id }, { $set: req.body });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Subcourse not found' });
    res.json({ success: true, message: 'Subcourse updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subcourse' });
  }
});

app.delete('/api/subcourses/:id', async (req, res) => {
  try {
    const result = await db.collection('subcourses').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Subcourse not found' });
    res.json({ success: true, message: 'Subcourse deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subcourse' });
  }
});

app.get('/api/instructions', async (req, res) => {
  try {
    const instructions = await db.collection('instructions').find({}).toArray();
    res.json(instructions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instructions' });
  }
});

app.post('/api/instructions', async (req, res) => {
  try {
    const result = await db.collection('instructions').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create instruction' });
  }
});

app.put('/api/instructions/:id', async (req, res) => {
  try {
    const result = await db.collection('instructions').updateOne({ id: req.params.id }, { $set: req.body });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Instruction not found' });
    res.json({ success: true, message: 'Instruction updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update instruction' });
  }
});

app.delete('/api/instructions/:id', async (req, res) => {
  try {
    const result = await db.collection('instructions').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Instruction not found' });
    res.json({ success: true, message: 'Instruction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete instruction' });
  }
});

app.get('/api/exam-documents', async (req, res) => {
  try {
    const docs = await db.collection('examDocuments').find({}).toArray();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam documents' });
  }
});

app.post('/api/exam-documents', async (req, res) => {
  try {
    const result = await db.collection('examDocuments').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exam document' });
  }
});

app.put('/api/exam-documents/:id', async (req, res) => {
  try {
    const result = await db.collection('examDocuments').updateOne({ id: req.params.id }, { $set: req.body });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Exam document not found' });
    res.json({ success: true, message: 'Exam document updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exam document' });
  }
});

app.delete('/api/exam-documents/:id', async (req, res) => {
  try {
    const result = await db.collection('examDocuments').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Exam document not found' });
    res.json({ success: true, message: 'Exam document deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exam document' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const news = await db.collection('news').find({}).toArray();
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.post('/api/news', async (req, res) => {
  try {
    const result = await db.collection('news').insertOne({ ...req.body, createdAt: new Date() });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news' });
  }
});

app.put('/api/news/:id', async (req, res) => {
  try {
    const result = await db.collection('news').updateOne({ id: req.params.id }, { $set: req.body });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'News not found' });
    res.json({ success: true, message: 'News updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news' });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const result = await db.collection('news').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'News not found' });
    res.json({ success: true, message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await db.collection('notifications').find({}).toArray();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const result = await db.collection('notifications').insertOne({ ...req.body, createdAt: new Date(), sent: false });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const result = await db.collection('notifications').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Dashboard Stats API
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [testsCount, packagesCount, studentsCount, questionsCount, buyersData, ordersData] = await Promise.all([
      db.collection('tests').countDocuments(),
      db.collection('packages').countDocuments() + db.collection('store').countDocuments(),
      db.collection('students').countDocuments(),
      db.collection('questions').countDocuments(),
      db.collection('buyers').find({}).sort({ date: -1 }).limit(10).toArray(),
      db.collection('orders').find({}).sort({ createdAt: -1 }).limit(10).toArray()
    ]);

    res.json({
      liveTests: testsCount,
      activePackages: packagesCount,
      registrations: studentsCount,
      questionsBank: questionsCount,
      recentBuyers: buyersData,
      recentOrders: ordersData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Student Authentication Routes
app.post('/api/students/register', async (req, res) => {
  try {
    const { name, email, phone, password, class: studentClass, target } = req.body;
    
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone and password are required' });
    }
    
    const existingStudent = await db.collection('students').findOne({ phone });
    if (existingStudent) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    const studentId = 'STU-' + Date.now();
    const student = {
      id: studentId,
      name,
      email: email || '',
      phone,
      password,
      class: studentClass || '11th',
      target: target || 'NEET',
      enrolledCourses: [],
      createdAt: new Date(),
      status: 'active'
    };
    
    await db.collection('students').insertOne(student);
    
    const { password: _, ...studentWithoutPassword } = student;
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      student: studentWithoutPassword
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/api/students/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }
    
    const student = await db.collection('students').findOne({ phone });
    
    if (!student) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }
    
    if (student.password !== password) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }
    
    const { password: _, ...studentWithoutPassword } = student;
    res.json({ 
      success: true, 
      message: 'Login successful',
      student: studentWithoutPassword
    });
  } catch (error) {
    console.error('Error logging in student:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.get('/api/students/:id/courses', async (req, res) => {
  try {
    const student = await db.collection('students').findOne({ id: req.params.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const enrolledCourseIds = student.enrolledCourses || [];
    if (enrolledCourseIds.length === 0) {
      return res.json([]);
    }
    
    const courses = await db.collection('courses').find({ 
      id: { $in: enrolledCourseIds } 
    }).toArray();
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Enroll student in a course
app.post('/api/students/:id/enroll', async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }
    
    const student = await db.collection('students').findOne({ id: req.params.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const course = await db.collection('courses').findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const enrolledCourses = student.enrolledCourses || [];
    if (enrolledCourses.includes(courseId)) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    await db.collection('students').updateOne(
      { id: req.params.id },
      { $push: { enrolledCourses: courseId } }
    );
    
    // Update course enrollment count
    await db.collection('courses').updateOne(
      { id: courseId },
      { $inc: { studentsEnrolled: 1 } }
    );
    
    // Create enrollment record
    await db.collection('enrollments').insertOne({
      id: `enroll_${Date.now()}`,
      studentId: req.params.id,
      courseId,
      enrolledAt: new Date(),
      progress: { completedVideos: [], completedTests: [] }
    });
    
    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Check if student is enrolled in a course
app.get('/api/students/:id/enrolled/:courseId', async (req, res) => {
  try {
    const student = await db.collection('students').findOne({ id: req.params.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const isEnrolled = (student.enrolledCourses || []).includes(req.params.courseId);
    res.json({ enrolled: isEnrolled });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    res.status(500).json({ error: 'Failed to check enrollment' });
  }
});

// Get student's enrollment progress for a course
app.get('/api/students/:id/courses/:courseId/progress', async (req, res) => {
  try {
    const enrollment = await db.collection('enrollments').findOne({
      studentId: req.params.id,
      courseId: req.params.courseId
    });
    
    if (!enrollment) {
      return res.json({ completedVideos: [], completedTests: [], completedNotes: [] });
    }
    
    res.json(enrollment.progress || { completedVideos: [], completedTests: [], completedNotes: [] });
  } catch (error) {
    console.error('Error fetching enrollment progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update student's progress in a course
app.put('/api/students/:id/courses/:courseId/progress', async (req, res) => {
  try {
    const { videoId, testId, noteId, action } = req.body;
    
    const updateField = videoId ? 'progress.completedVideos' : 
                        testId ? 'progress.completedTests' : 
                        'progress.completedNotes';
    const itemId = videoId || testId || noteId;
    
    if (action === 'complete') {
      await db.collection('enrollments').updateOne(
        { studentId: req.params.id, courseId: req.params.courseId },
        { $addToSet: { [updateField]: itemId } }
      );
    } else {
      await db.collection('enrollments').updateOne(
        { studentId: req.params.id, courseId: req.params.courseId },
        { $pull: { [updateField]: itemId } }
      );
    }
    
    res.json({ success: true, message: 'Progress updated' });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Messages Routes for Chat
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).toArray();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const result = await db.collection('messages').insertOne({ 
      ...req.body, 
      createdAt: new Date() 
    });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Student Progress Routes
app.get('/api/students/:id/progress', async (req, res) => {
  try {
    const progress = await db.collection('studentProgress').findOne({ studentId: req.params.id });
    if (!progress) {
      res.json({ physics: 45, chemistry: 60, biology: 35 });
    } else {
      res.json(progress);
    }
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

app.put('/api/students/:id/progress', async (req, res) => {
  try {
    const result = await db.collection('studentProgress').updateOne(
      { studentId: req.params.id },
      { $set: { ...req.body, studentId: req.params.id } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Progress updated' });
  } catch (error) {
    console.error('Error updating student progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Student Test Results Routes
app.get('/api/students/:id/test-results', async (req, res) => {
  try {
    const results = await db.collection('testResults').find({ studentId: req.params.id }).toArray();
    res.json(results);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

app.post('/api/students/:id/test-results', async (req, res) => {
  try {
    const result = await db.collection('testResults').insertOne({
      ...req.body,
      studentId: req.params.id,
      submittedAt: new Date()
    });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error saving test result:', error);
    res.status(500).json({ error: 'Failed to save test result' });
  }
});

// Student Downloads Routes
app.get('/api/students/:id/downloads', async (req, res) => {
  try {
    const downloads = await db.collection('downloads').find({ studentId: req.params.id }).toArray();
    res.json(downloads);
  } catch (error) {
    console.error('Error fetching downloads:', error);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

app.post('/api/students/:id/downloads', async (req, res) => {
  try {
    const result = await db.collection('downloads').insertOne({
      ...req.body,
      studentId: req.params.id,
      downloadedAt: new Date()
    });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error saving download:', error);
    res.status(500).json({ error: 'Failed to save download' });
  }
});

// Student Watch History Routes
app.get('/api/students/:id/watch-history', async (req, res) => {
  try {
    const history = await db.collection('watchHistory').find({ studentId: req.params.id }).sort({ watchedAt: -1 }).toArray();
    res.json(history);
  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.status(500).json({ error: 'Failed to fetch watch history' });
  }
});

app.post('/api/students/:id/watch-history', async (req, res) => {
  try {
    const result = await db.collection('watchHistory').insertOne({
      ...req.body,
      studentId: req.params.id,
      watchedAt: new Date()
    });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error saving watch history:', error);
    res.status(500).json({ error: 'Failed to save watch history' });
  }
});

// Live Classes Routes
app.get('/api/live-classes', async (req, res) => {
  try {
    const classes = await db.collection('liveClasses').find({}).toArray();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ error: 'Failed to fetch live classes' });
  }
});

app.post('/api/live-classes', async (req, res) => {
  try {
    const result = await db.collection('liveClasses').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(500).json({ error: 'Failed to create live class' });
  }
});

app.put('/api/live-classes/:id', async (req, res) => {
  try {
    const result = await db.collection('liveClasses').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Live class not found' });
    res.json({ success: true, message: 'Live class updated' });
  } catch (error) {
    console.error('Error updating live class:', error);
    res.status(500).json({ error: 'Failed to update live class' });
  }
});

app.delete('/api/live-classes/:id', async (req, res) => {
  try {
    const result = await db.collection('liveClasses').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Live class not found' });
    res.json({ success: true, message: 'Live class deleted' });
  } catch (error) {
    console.error('Error deleting live class:', error);
    res.status(500).json({ error: 'Failed to delete live class' });
  }
});

// E-books Routes
app.get('/api/ebooks', async (req, res) => {
  try {
    const ebooks = await db.collection('ebooks').find({}).toArray();
    res.json(ebooks);
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    res.status(500).json({ error: 'Failed to fetch ebooks' });
  }
});

app.post('/api/ebooks', async (req, res) => {
  try {
    const result = await db.collection('ebooks').insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    console.error('Error creating ebook:', error);
    res.status(500).json({ error: 'Failed to create ebook' });
  }
});

app.put('/api/ebooks/:id', async (req, res) => {
  try {
    const result = await db.collection('ebooks').updateOne(
      { id: req.params.id },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Ebook not found' });
    res.json({ success: true, message: 'Ebook updated' });
  } catch (error) {
    console.error('Error updating ebook:', error);
    res.status(500).json({ error: 'Failed to update ebook' });
  }
});

app.delete('/api/ebooks/:id', async (req, res) => {
  try {
    const result = await db.collection('ebooks').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Ebook not found' });
    res.json({ success: true, message: 'Ebook deleted' });
  } catch (error) {
    console.error('Error deleting ebook:', error);
    res.status(500).json({ error: 'Failed to delete ebook' });
  }
});

// Routes for Live Classes
app.get('/api/courses/:courseId/live-classes', async (req, res) => {
  try {
    const classes = await db.collection('liveClasses').find({ courseId: req.params.courseId }).toArray();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ error: 'Failed to fetch live classes' });
  }
});

app.post('/api/courses/:courseId/live-classes', async (req, res) => {
  try {
    const classData = { ...req.body, courseId: req.params.courseId };
    const result = await db.collection('liveClasses').insertOne(classData);
    res.status(201).json({ _id: result.insertedId, ...classData });
  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(500).json({ error: 'Failed to create live class' });
  }
});

app.put('/api/courses/:courseId/live-classes/:id', async (req, res) => {
  try {
    const result = await db.collection('liveClasses').updateOne(
      { id: req.params.id, courseId: req.params.courseId },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Live class not found' });
    res.json({ success: true, message: 'Live class updated' });
  } catch (error) {
    console.error('Error updating live class:', error);
    res.status(500).json({ error: 'Failed to update live class' });
  }
});

app.delete('/api/courses/:courseId/live-classes/:id', async (req, res) => {
  try {
    const result = await db.collection('liveClasses').deleteOne({ id: req.params.id, courseId: req.params.courseId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Live class not found' });
    res.json({ success: true, message: 'Live class deleted' });
  } catch (error) {
    console.error('Error deleting live class:', error);
    res.status(500).json({ error: 'Failed to delete live class' });
  }
});

// Get all live classes for enrolled student courses
app.get('/api/students/:studentId/live-classes', async (req, res) => {
  try {
    const enrollments = await db.collection('enrollments').find({ studentId: req.params.studentId }).toArray();
    const courseIds = enrollments.map(e => e.courseId);
    const classes = await db.collection('liveClasses').find({ courseId: { $in: courseIds } }).toArray();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching student live classes:', error);
    res.status(500).json({ error: 'Failed to fetch live classes' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (isProduction) {
    const distPath = path.join(__dirname, "dist", "index.html");
    if (fs.existsSync(distPath)) {
      app.get('*', (req, res) => {
        res.sendFile(distPath);
      });
    }
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: {
          server: httpServer,
        },
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
