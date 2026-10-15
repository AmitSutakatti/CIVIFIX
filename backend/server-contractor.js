import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import models to register them with Mongoose
import './models/User.js';
import './models/Complaint.js';
import './models/Notification.js';
import './models/MunicipalOffice.js';
import './models/Chat.js';
import './models/Quotation.js';

// Import routes - Contractor Portal Only
import authRoutes from './routes/user/authRoutes.js';
import contractorRoutes from './routes/contractor/contractorRoutes.js';
import chatRoutes from './routes/contractor/chatRoutes.js';
import quotationRoutes from './routes/contractor/quotationRoutes.js';

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });

if (envResult.error) {
  console.warn('⚠️  Warning: Could not load .env file:', envResult.error.message);
} else {
  console.log('✅ Environment variables loaded from .env file');
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CONTRACTOR_FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images (shared with other portals)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - Contractor Portal Only
app.use('/api/auth', authRoutes);
app.use('/api/contractor', contractorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quotation', quotationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CivicFix Contractor Portal API is running' });
});

// Connect to MongoDB
const PORT = process.env.CONTRACTOR_PORT || 8001;
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
      console.log(`🚀 Contractor Portal Backend running on port ${PORT}`);
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

