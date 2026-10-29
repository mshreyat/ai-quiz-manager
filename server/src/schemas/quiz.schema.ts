import { z } from 'zod';
import { questionSchema } from './question.schema';

export const difficultyEnum = z.enum(['easy', 'medium', 'hard'], {
  errorMap: () => ({ message: "Difficulty must be one of 'easy', 'medium', or 'hard'" }),
});

export const createQuizSchema = z.object({
  title: z
    .string({ required_error: 'Quiz title is required' })
    .trim()
    .min(3, 'Quiz title must be at least 3 characters long')
    .max(150, 'Quiz title cannot exceed 150 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Quiz description cannot exceed 1000 characters')
    .default(''),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(2, 'Category must be at least 2 characters long')
    .max(50, 'Category cannot exceed 50 characters')
    .default('General'),
  difficulty: difficultyEnum.default('medium'),
  isPublished: z.boolean().default(false),
  timeLimitSeconds: z
    .number()
    .int()
    .min(30, 'Total quiz time limit must be at least 30 seconds')
    .max(7200, 'Total quiz time limit cannot exceed 120 minutes')
    .optional(),
  questions: z.array(questionSchema).optional().default([]),
});

export const updateQuizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Quiz title must be at least 3 characters long')
    .max(150, 'Quiz title cannot exceed 150 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, 'Quiz description cannot exceed 1000 characters')
    .optional(),
  category: z
    .string()
    .trim()
    .min(2, 'Category must be at least 2 characters long')
    .max(50, 'Category cannot exceed 50 characters')
    .optional(),
  difficulty: difficultyEnum.optional(),
  isPublished: z.boolean().optional(),
  timeLimitSeconds: z
    .number()
    .int()
    .min(30, 'Total quiz time limit must be at least 30 seconds')
    .max(7200, 'Total quiz time limit cannot exceed 120 minutes')
    .optional(),
  questions: z.array(questionSchema).optional(),
});

export const quizIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Quiz ID must be a valid UUID' }),
});

export const quizQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'all']).optional(),
  isPublished: z
    .string()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    })
    .optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 20)) : 20)),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuizQueryParams = z.infer<typeof quizQuerySchema>;
