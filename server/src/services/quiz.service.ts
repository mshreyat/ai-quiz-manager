import { prisma } from '../config/prisma';
import { CreateQuizInput, UpdateQuizInput, QuizQueryParams } from '../schemas/quiz.schema';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class QuizService {
  /**
   * List quizzes with search, filtering, and pagination
   */
  async listQuizzes(params: QuizQueryParams) {
    const { search, category, difficulty, isPublished, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.QuizWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    const [total, quizzes] = await prisma.$transaction([
      prisma.quiz.count({ where }),
      prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { questions: true, sessions: true },
          },
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      quizzes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieve a single quiz by ID with all its questions
   */
  async getQuizById(id: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { sessions: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError(`Quiz with ID '${id}' not found`);
    }

    return quiz;
  }

  /**
   * Create a new quiz with optional embedded questions
   */
  async createQuiz(input: CreateQuizInput, creatorId?: string) {
    const { questions = [], ...quizData } = input;

    // Optional creator association if user is identified
    let creatorConnect;
    if (creatorId) {
      const userExists = await prisma.user.findUnique({ where: { id: creatorId } });
      if (userExists) {
        creatorConnect = { connect: { id: creatorId } };
      }
    }

    const quiz = await prisma.quiz.create({
      data: {
        ...quizData,
        ...(creatorConnect ? { creator: creatorConnect } : {}),
        questions: {
          create: questions.map((q, idx) => ({
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            timeLimitSeconds: q.timeLimitSeconds ?? 30,
            order: q.order ?? idx,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    return quiz;
  }

  /**
   * Update quiz metadata and optionally replace its questions
   */
  async updateQuiz(id: string, input: UpdateQuizInput) {
    // Ensure quiz exists
    await this.getQuizById(id);

    const { questions, ...quizData } = input;

    return await prisma.$transaction(async (tx) => {
      // If questions are provided, replace them atomically
      if (questions !== undefined) {
        // Delete existing questions
        await tx.question.deleteMany({
          where: { quizId: id },
        });

        // Insert new questions
        if (questions.length > 0) {
          await tx.question.createMany({
            data: questions.map((q, idx) => ({
              quizId: id,
              text: q.text,
              options: q.options,
              correctIndex: q.correctIndex,
              explanation: q.explanation,
              timeLimitSeconds: q.timeLimitSeconds ?? 30,
              order: q.order ?? idx,
            })),
          });
        }
      }

      // Update quiz record
      const updated = await tx.quiz.update({
        where: { id },
        data: quizData,
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { questions: true, sessions: true },
          },
        },
      });

      return updated;
    });
  }

  /**
   * Delete a quiz and all cascade-associated questions
   */
  async deleteQuiz(id: string) {
    await this.getQuizById(id);

    await prisma.quiz.delete({
      where: { id },
    });

    return { id, deleted: true };
  }

  /**
   * Retrieve aggregate statistics for the dashboard
   */
  async getDashboardSummary() {
    const [totalQuizzes, publishedQuizzes, totalQuestions, easyCount, mediumCount, hardCount] =
      await prisma.$transaction([
        prisma.quiz.count(),
        prisma.quiz.count({ where: { isPublished: true } }),
        prisma.question.count(),
        prisma.quiz.count({ where: { difficulty: 'easy' } }),
        prisma.quiz.count({ where: { difficulty: 'medium' } }),
        prisma.quiz.count({ where: { difficulty: 'hard' } }),
      ]);

    return {
      totalQuizzes,
      publishedQuizzes,
      draftQuizzes: totalQuizzes - publishedQuizzes,
      totalQuestions,
      difficultyBreakdown: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
    };
  }
}

export const quizService = new QuizService();
