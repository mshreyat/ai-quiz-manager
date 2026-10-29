import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from server root or parent root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number (1-65535)',
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/quizforge_db?schema=public'),
  GEMINI_API_KEY: z.string().optional().default(''),
  JWT_SECRET: z.string().default('quizforge-super-secret-jwt-key-2026'),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Environment configuration error. Check your .env file.');
  }
  return result.data;
};

export const env = parseEnv();

// Ensure process.env.DATABASE_URL is populated for Prisma CLI and PrismaClient
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}
export type EnvConfig = z.infer<typeof envSchema>;
