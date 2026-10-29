import { Request } from 'express';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  name?: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ path: string; message: string }>;
  timestamp: string;
}

export interface QuestionData {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timeLimitSeconds: number;
  order?: number;
}

export interface CreateQuizDTO {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  isPublished?: boolean;
  timeLimitSeconds?: number;
  questions?: QuestionData[];
}

export interface UpdateQuizDTO {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: Difficulty;
  isPublished?: boolean;
  timeLimitSeconds?: number;
  questions?: QuestionData[];
}

export interface AIQuizRequestDTO {
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
  category?: string;
}
