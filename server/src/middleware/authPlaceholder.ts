import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthenticatedUser } from '../types';

/**
 * Placeholder Authentication Middleware
 *
 * SCOPE NOTE: Full JWT/Session authentication is planned for a subsequent phase.
 * In this foundational phase:
 * 1. If an 'x-user-id' header is supplied, it attaches a simulated user context.
 * 2. Otherwise, requests proceed unauthenticated or with a guest user.
 * 3. IMPORTANT: Ownership security is NOT claimed to be complete until JWT verification
 *    and password hashing are activated.
 */
export const placeholderAuthMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const customUserId = req.headers['x-user-id'] as string;

  if (customUserId) {
    const simulatedUser: AuthenticatedUser = {
      id: customUserId,
      email: `${customUserId}@example.com`,
      name: `User ${customUserId.slice(0, 6)}`,
      role: 'USER', // Never trust client-supplied role headers
    };
    req.user = simulatedUser;
  }

  next();
};

export const requireAuthPlaceholder = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. (Full auth system pending Phase 2; pass "x-user-id" header for testing)',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
};
