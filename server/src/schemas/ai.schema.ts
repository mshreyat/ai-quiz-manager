import { z } from 'zod';
import { questionSchema } from './question.schema';
import { difficultyEnum } from './quiz.schema';

export const generateAIQuizSchema = z.object({
  topic: z
    .string({ required_error: 'Topic is required' })
    .trim()
    .min(2, 'Topic must be at least 2 characters long')
    .max(200, 'Topic cannot exceed 200 characters'),
  difficulty: difficultyEnum.default('medium'),
  questionCount: z
    .number({ required_error: 'Question count is required' })
    .int('Question count must be an integer')
    .min(1, 'Question count must be between 1 and 10')
    .max(10, 'Question count must be between 1 and 10'),
  category: z
    .string()
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category cannot exceed 50 characters')
    .optional(),
  title: z
    .string()
    .trim()
    .max(150)
    .optional(),
});

// Schema for validating the raw JSON response returned by the AI provider
export const aiGeneratedResponseSchema = z.object({
  title: z.string().trim().min(3),
  description: z.string().trim().optional().default(''),
  category: z.string().trim().min(2).optional().default('General'),
  questions: z.array(
    z.object({
      text: z.string().trim().min(3),
      options: z.array(z.string().trim().min(1)).length(4),
      correctIndex: z.number().int().min(0).max(3),
      explanation: z.string().trim().min(3),
      timeLimitSeconds: z.number().int().min(5).max(300).default(30),
    })
  ).min(1).max(10),
});

export type GenerateAIQuizInput = z.infer<typeof generateAIQuizSchema>;
export type AIGeneratedQuizOutput = z.infer<typeof aiGeneratedResponseSchema>;
