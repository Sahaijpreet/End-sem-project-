import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import pyqRoutes from './routes/pyqRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import studyGroupRoutes from './routes/studyGroupRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';
import userRoutes from './routes/userRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;

const corsOptions = {
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
};

// Socket.io
const io = new Server(httpServer, { cors: corsOptions });

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select('-PasswordHash');
    next();
  } catch {
    next(new Error('Auth failed'));
  }
});

io.on('connection', (socket) => {
  socket.on('join_conversation', (convId) => socket.join(`conv_${convId}`));
  socket.on('join_group', (groupId) => socket.join(`group_${groupId}`));
  socket.on('leave_group', (groupId) => socket.leave(`group_${groupId}`));

  socket.on('send_message', ({ convId, message }) => {
    socket.to(`conv_${convId}`).emit('new_message', message);
  });

  socket.on('send_group_message', ({ groupId, message }) => {
    socket.to(`group_${groupId}`).emit('new_group_message', message);
  });
});

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts, try again later.' } });
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

app.get('/', (req, res) => res.send('SAAR Backend API is running...'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pyqs', pyqRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/groups', studyGroupRoutes);
app.use('/api/forum', doubtRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/syllabus', syllabusRoutes);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
