import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from '@/routes/auth';
import notesRouter from '@/routes/notes';
import adminRouter from '@/routes/admin';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// API logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  // When response finishes, log response time and status
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
  });

  next();
});

// Mount routes
app.use('/auth', authRouter);
app.use('/notes', notesRouter);
app.use('/admin', adminRouter);

export default app;