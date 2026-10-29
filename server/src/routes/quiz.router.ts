import { Router } from 'express';
import {
  createQuiz,
  deleteQuiz,
  getDashboardSummary,
  getQuizById,
  listQuizzes,
  updateQuiz,
} from '../controllers/quiz.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createQuizSchema,
  quizIdParamSchema,
  quizQuerySchema,
  updateQuizSchema,
} from '../schemas/quiz.schema';
import { placeholderAuthMiddleware } from '../middleware/authPlaceholder';

export const quizRouter = Router();

quizRouter.use(placeholderAuthMiddleware);

// Dashboard summary endpoint (must precede /:id)
quizRouter.get('/summary', getDashboardSummary);

// Quiz listing with query filtering & pagination
quizRouter.get('/', validateQuery(quizQuerySchema), listQuizzes);

// Get single quiz by ID with questions
quizRouter.get('/:id', validateParams(quizIdParamSchema), getQuizById);

// Create new quiz
quizRouter.post('/', validateBody(createQuizSchema), createQuiz);

// Update existing quiz and questions
quizRouter.put(
  '/:id',
  validateParams(quizIdParamSchema),
  validateBody(updateQuizSchema),
  updateQuiz
);

// Delete quiz
quizRouter.delete('/:id', validateParams(quizIdParamSchema), deleteQuiz);
