import { Router } from 'express';
import { getMe, login, register } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { placeholderAuthMiddleware } from '../middleware/authPlaceholder';

export const authRouter = Router();

authRouter.use(placeholderAuthMiddleware);

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.get('/me', getMe);
