import { Request, Response } from 'express';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { AuthenticatedRequest } from '../types';
import { sendSuccess } from '../utils/response';

/**
 * Placeholder Authentication Controller
 *
 * Current Phase Status:
 * User registration, login, and token generation are stubbed out as architectural placeholders.
 * Database models for User and relationships are ready in schema.prisma.
 * Full JWT authentication flow with bcrypt password hashing is designated for Phase 2.
 */

export const register = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as RegisterInput;

  // Documented unimplemented status
  res.status(501).json({
    success: false,
    message: 'User registration endpoint is a placeholder in this phase. Schema validation succeeded.',
    received: {
      name: input.name,
      email: input.email,
    },
    implementationNote: 'Full user persistence with password hashing will be activated in Phase 2.',
    timestamp: new Date().toISOString(),
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as LoginInput;

  // Documented unimplemented status
  res.status(501).json({
    success: false,
    message: 'User authentication/login is a placeholder in this phase. Schema validation succeeded.',
    received: {
      email: input.email,
    },
    implementationNote: 'JWT generation and session issuance will be activated in Phase 2.',
    timestamp: new Date().toISOString(),
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user) {
    sendSuccess(res, req.user, 'Active user session (from placeholder middleware)');
    return;
  }

  sendSuccess(res, { guest: true, authenticated: false }, 'Unauthenticated guest context');
};
