export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id?: string;
  quizId?: string;
  text: string;
  options: [string, string, string, string] | string[];
  correctIndex: number;
  explanation: string;
  timeLimitSeconds: number;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  isPublished: boolean;
  timeLimitSeconds: number;
  creatorId?: string;
  questions?: Question[];
  _count?: {
    questions: number;
    sessions?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizInput {
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  isPublished?: boolean;
  timeLimitSeconds?: number;
  questions?: Omit<Question, 'id' | 'quizId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateQuizInput extends Partial<CreateQuizInput> {
  questions?: Question[];
}

export interface GenerateAIQuizInput {
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
  category?: string;
}

export interface QuizFilterOptions {
  search?: string;
  difficulty?: Difficulty | 'all';
  category?: string;
  isPublished?: boolean | 'all';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}
