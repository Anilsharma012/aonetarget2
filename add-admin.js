import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);

async function addAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db('aonetarget');
    
    // Check if admin collection exists
    const collections = await db.listCollections().toArray();
    const adminCollectionExists = collections.some(col => col.name === 'admins');
    
    if (!adminCollectionExists) {
      console.log('Creating admins collection...');
    }
    
    // Delete existing admin credentials
    await db.collection('admins').deleteMany({});
    console.log('Cleared existing admin credentials');
    
    // Add admin credentials
    const adminCredentials = {
      adminId: 'admin',
      password: 'aone@2026',
      name: 'Admin User',
      email: 'admin@aonetarget.com',
      createdAt: new Date()
    };
    
    const result = await db.collection('admins').insertOne(adminCredentials);
    console.log('✓ Admin credentials saved successfully');
    console.log('\nAdmin Credentials:');
    console.log('─────────────────────────────────');
    console.log(`Admin ID: ${adminCredentials.adminId}`);
    console.log(`Password: ${adminCredentials.password}`);
    console.log(`Name: ${adminCredentials.name}`);
    console.log(`Email: ${adminCredentials.email}`);
    console.log('─────────────────────────────────');
    console.log('\nYou can now login to the admin panel with these credentials!');
    
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding admin:', error);
    process.exit(1);
  }
}

addAdmin();
