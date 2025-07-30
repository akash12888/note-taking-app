import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/database';
import errorHandler from './middleware/errorHandler';
import logger from './middleware/logger';

import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  import('./config/googleOAuth');
}

const app: Application = express();
connectDB();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'], 
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI!,
    touchAfter: 24 * 3600 
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
app.use(limiter);

app.use(logger);

// Root route redirect
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT!) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS enabled for: ${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173'}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

export default app;
