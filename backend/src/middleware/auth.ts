import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Use token only from HttpOnly cookie. Do NOT accept Authorization header/Bearer tokens.
    const token = (req.cookies as Record<string, string> | undefined)?.[process.env.AUTH_COOKIE_NAME || 'token'];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role?: string };
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch (err) {
    console.error('Auth error', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
