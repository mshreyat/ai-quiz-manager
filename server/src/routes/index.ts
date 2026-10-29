import { Router } from 'express';
import { healthRouter } from './health.router';
import { quizRouter } from './quiz.router';
import { aiRouter } from './ai.router';
import { authRouter } from './auth.router';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/quizzes', quizRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/auth', authRouter);
