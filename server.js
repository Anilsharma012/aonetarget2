import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('  Body:', JSON.stringify(req.body).substring(0, 100));
  }
  next();
});

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
