import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { aiService } from '../services/ai.service';
import { GenerateAIQuizInput } from '../schemas/ai.schema';
import { sendSuccess } from '../utils/response';

export const generateQuiz = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = req.body as GenerateAIQuizInput;
    const generatedQuiz = await aiService.generateQuiz(input);
    sendSuccess(res, generatedQuiz, 'AI quiz generated and validated successfully');
  } catch (error) {
    next(error);
  }
};

export const getAIStatus = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const isConfigured = aiService.isConfigured();
  sendSuccess(res, { isConfigured }, isConfigured ? 'AI service is ready' : 'AI service requires API key');
};
