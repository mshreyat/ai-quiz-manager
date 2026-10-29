import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { quizService } from '../services/quiz.service';
import { sendCreated, sendSuccess } from '../utils/response';
import { CreateQuizInput, QuizQueryParams, UpdateQuizInput } from '../schemas/quiz.schema';

export const listQuizzes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const params = req.query as unknown as QuizQueryParams;
    const result = await quizService.listQuizzes(params);
    sendSuccess(res, result, 'Quizzes retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const quiz = await quizService.getQuizById(id);
    sendSuccess(res, quiz, 'Quiz retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createQuiz = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const input = req.body as CreateQuizInput;
    const creatorId = req.user?.id;
    const createdQuiz = await quizService.createQuiz(input, creatorId);
    sendCreated(res, createdQuiz, 'Quiz created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateQuiz = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const input = req.body as UpdateQuizInput;
    const updatedQuiz = await quizService.updateQuiz(id, input);
    sendSuccess(res, updatedQuiz, 'Quiz updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const result = await quizService.deleteQuiz(id);
    sendSuccess(res, result, 'Quiz deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await quizService.getDashboardSummary();
    sendSuccess(res, stats, 'Dashboard summary retrieved successfully');
  } catch (error) {
    next(error);
  }
};
