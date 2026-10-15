import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
app.use(cors({
  origin: process.env.USER_FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
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
  res.json({ status: 'OK', message: 'CivicFix User Portal API is running' });
});

// Connect to MongoDB
const PORT = process.env.USER_PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicfix';

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Create server with error handling
    const server = app.listen(PORT, () => {
      console.log(`🚀 User Portal Backend running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });

    // Handle port already in use error
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error('Please stop the process using this port or change the PORT in .env file.');
        console.error('\nTo find and kill the process:');
        console.error(`  Windows: netstat -ano | findstr :${PORT}`);
        console.error(`  Then: taskkill /PID <PID> /F`);
        console.error(`\nOr run: npm run kill:${PORT}`);
        process.exit(1);
      } else {
        console.error('\n❌ Server error:', error.message);
        process.exit(1);
      }
    });
  })
  .catch((error) => {
    console.error('\n❌ MongoDB connection error:', error.message);
    console.error('Current MONGODB_URI:', MONGODB_URI);
    process.exit(1);
  });

export default app;
