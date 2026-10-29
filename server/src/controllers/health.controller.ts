import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/prisma';
import { env } from '../config/env';
import { aiService } from '../services/ai.service';
import { sendSuccess } from '../utils/response';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const isDbConnected = await checkDatabaseConnection();
  const isAiConfigured = aiService.isConfigured();

  const healthData = {
    status: isDbConnected ? 'healthy' : 'degraded',
    version: '1.0.0',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      server: 'operational',
      database: isDbConnected ? 'connected' : 'unreachable (PostgreSQL not detected on DATABASE_URL)',
      aiProvider: isAiConfigured ? 'configured' : 'not configured (GEMINI_API_KEY placeholder)',
    },
    timestamp: new Date().toISOString(),
  };

  sendSuccess(res, healthData, 'QuizForge AI API health check completed');
};
