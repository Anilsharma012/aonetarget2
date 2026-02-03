import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
