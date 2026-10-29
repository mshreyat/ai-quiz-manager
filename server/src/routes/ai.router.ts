import { Router } from 'express';
import { generateQuiz, getAIStatus } from '../controllers/ai.controller';
import { validateBody } from '../middleware/validate';
import { generateAIQuizSchema } from '../schemas/ai.schema';
import { placeholderAuthMiddleware } from '../middleware/authPlaceholder';

export const aiRouter = Router();

aiRouter.use(placeholderAuthMiddleware);

// Generate quiz questions with Gemini AI
aiRouter.post('/generate', validateBody(generateAIQuizSchema), generateQuiz);

// Check if AI service is configured and ready
aiRouter.get('/status', getAIStatus);
