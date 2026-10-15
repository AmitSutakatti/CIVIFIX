import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
//RNC2Z65DT2TXU45S7HZ2QUXM-TWILIO SMS  API KEY
// Import routes - User Portal Only
import authRoutes from './routes/user/authRoutes.js';
import complaintRoutes from './routes/user/complaintRoutes.js';
import notificationRoutes from './routes/user/notificationRoutes.js';
import letterRoutes from './routes/user/letterRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - User Portal Only
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/letters', letterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CivicFix API is running' });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicfix';

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    family: 4, // Use IPv4, skip IPv6
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('\n❌ MongoDB connection error:', error.message);
    console.error('\n📋 To fix this issue, choose one of the following options:\n');
    console.error('Option 1: Use MongoDB Atlas (Cloud - Recommended)');
    console.error('  1. Go to https://www.mongodb.com/cloud/atlas/register');
    console.error('  2. Create a free cluster');
    console.error('  3. Get your connection string');
    console.error('  4. Update MONGODB_URI in backend/.env\n');
    console.error('Option 2: Install MongoDB locally');
    console.error('  1. Download from https://www.mongodb.com/try/download/community');
    console.error('  2. Install and start MongoDB service');
    console.error('  3. Or use: mongod --dbpath <your-data-path>\n');
    console.error('Option 3: Use Docker');
    console.error('  docker run -d -p 27017:27017 --name mongodb mongo\n');
    console.error('Current MONGODB_URI:', MONGODB_URI);
    console.error('\n⚠️  Server will not start without MongoDB connection.\n');
    process.exit(1);
  });

export default app;

