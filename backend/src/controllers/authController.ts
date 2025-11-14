import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { connect } from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'token';

function signToken(user: IUser) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function cookieOptions() {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
  };
}

export async function signup(req: Request, res: Response) {
  try {
    await connect();
    const { name, email, password, role } = req.body as { name: string; email: string; password: string; role?: string };
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = new User({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });
    await user.save();

    const token = signToken(user);

    // Set token as HTTP-only cookie
    res.cookie(COOKIE_NAME, token, cookieOptions());

  return res.status(201).json({ message: 'Signup successful', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    await connect();
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function logout(req: Request, res: Response) {
  await connect();
  const COOKIE_NAME_LOCAL = process.env.AUTH_COOKIE_NAME || 'token';
  res.clearCookie(COOKIE_NAME_LOCAL, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.json({ message: 'Logged out' });
}

export async function me(req: AuthRequest, res: Response) {
  await connect();
  // auth middleware should attach req.userId
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ message: 'User fetched', user });
}
