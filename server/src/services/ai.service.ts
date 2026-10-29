import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { GenerateAIQuizInput, aiGeneratedResponseSchema, AIGeneratedQuizOutput } from '../schemas/ai.schema';
import { AppError } from '../utils/errors';

export class AIService {
  private client: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '' && env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  /**
   * Check if AI generation is configured and available
   */
  isConfigured(): boolean {
    return (
      Boolean(env.GEMINI_API_KEY) &&
      env.GEMINI_API_KEY.trim() !== '' &&
      env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
    );
  }

  /**
   * Generate quiz questions using Google Gemini
   */
  async generateQuiz(input: GenerateAIQuizInput): Promise<AIGeneratedQuizOutput> {
    if (!this.isConfigured()) {
      throw new AppError(
        'GEMINI_API_KEY is not configured. Please add a valid GEMINI_API_KEY in server/.env to use AI quiz generation.',
        503
      );
    }

    const { topic, difficulty, questionCount, category = 'General', title } = input;

    const systemPrompt = `You are QuizForge AI, an expert educational assessment creator.
Generate a high-quality quiz about the topic: "${topic}".
Difficulty level: ${difficulty}.
Total questions: ${questionCount}.
Category: ${category}.

Rules:
1. Each question must have EXACTLY 4 answer options.
2. All 4 answer options must be unique and plausible.
3. correctIndex must be an integer (0, 1, 2, or 3) indicating the exact index of the correct option.
4. explanation must provide an informative, educational rationale for why that option is correct.
5. timeLimitSeconds must be between 15 and 60 seconds (default 30).
6. Return ONLY valid JSON matching this exact structure:
{
  "title": "${title || `${topic} Quiz`}",
  "description": "An engaging ${difficulty} difficulty quiz covering ${topic}.",
  "category": "${category}",
  "questions": [
    {
      "text": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct.",
      "timeLimitSeconds": 30
    }
  ]
}`;

    try {
      const genAI = this.client || new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(systemPrompt);
      const rawText = result.response.text();

      // Clean markdown fences if any are returned
      const cleanJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsedJson = JSON.parse(cleanJson);

      // Validate output with Zod schema
      const validationResult = aiGeneratedResponseSchema.safeParse(parsedJson);

      if (!validationResult.success) {
        console.error('AI schema validation error:', validationResult.error.format());
        throw new AppError(
          'AI service generated an unexpected quiz format. Please try again with a different topic.',
          502
        );
      }

      return validationResult.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new AppError('AI provider returned invalid JSON. Please try again.', 502);
      }
      const message = error instanceof Error ? error.message : 'Unknown AI generation error';
      throw new AppError(`AI quiz generation failed: ${message}`, 502);
    }
  }
}

export const aiService = new AIService();
