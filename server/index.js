import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection check middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database connection is not established. Please verify that your local MongoDB server is running.'
    });
  }
  next();
});

// Routes
app.use('/api', apiRoutes);

// Connect to Database
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Analytics server running on http://localhost:${PORT}`);
});
