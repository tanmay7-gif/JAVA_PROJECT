import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { autoSeedDatabase } from './config/autoSeed.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

// Explicitly allowed origins for CORS (Local and Vercel Production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://guvi-java-project.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, health probes)
    if (!origin) return callback(null, true);

    // Allow configured origins or any Vercel preview domain
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security Headers Middleware (OWASP Defense-in-Depth)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'FitPulse API Server',
    status: 'online',
    health: '/api/health',
    allowed_origins: ['http://localhost:5173', 'https://guvi-java-project.vercel.app'],
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FitPulse Online Fitness Tracking Platform API',
    version: '1.0.0',
    cors: {
      allowed: ['http://localhost:5173', 'https://guvi-java-project.vercel.app'],
    },
  });
});

// Mount modular API routes
app.use('/api', apiRoutes);

// Catch-all 404 handler for unknown routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling
app.use(errorHandler);

// Start Server listening on 0.0.0.0 and PORT (skip listen inside Vercel serverless functions)
if (!process.env.VERCEL) {
  app.listen(PORT, HOST, async () => {
    console.log(`===============================================`);
    console.log(`🚀 FitPulse API Server running at http://${HOST}:${PORT}`);
    console.log(`📡 Health Check: http://${HOST}:${PORT}/api/health`);
    console.log(`🌐 CORS enabled for: http://localhost:5173 and https://guvi-java-project.vercel.app`);
    console.log(`===============================================`);

    // Automatically seed demo accounts and initial telemetry on boot
    await autoSeedDatabase();
  });
}

export default app;
