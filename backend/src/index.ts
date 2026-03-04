import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { apiLimiter } from './middleware/rateLimit';
import { httpLogger, logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { setupAnalysisSocket } from './socket/analysis.socket';
import movieRoutes from './routes/movie';
import reviewsRoutes from './routes/reviews';
import sentimentRoutes from './routes/sentiment';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// --- CORS Configuration ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// --- Socket.io Setup ---
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

setupAnalysisSocket(io);

// --- Middleware ---
app.use(express.json({ limit: '1mb' }));
app.use(httpLogger);
app.use('/api/', apiLimiter);

// --- Routes ---
app.use('/api/movie', movieRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/sentiment', sentimentRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    socketClients: io.engine.clientsCount,
  });
});

// --- Error Handling ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: 'The requested endpoint does not exist.',
  });
});

app.use(errorHandler);

// --- Start Server ---
server.listen(PORT, () => {
  logger.info(`🎬 CineScope AI Backend running on http://localhost:${PORT}`);
  logger.info(`📋 Health check: http://localhost:${PORT}/api/health`);
  logger.info(`🔌 Socket.io ready for connections`);
});

export default app;
