import { Router, Response } from 'express';
import { listUsers, banUser, unbanUser } from '../controllers/adminController';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require auth and admin role check in controller or middleware.
router.use(requireAuth);

// List users with filters
router.get('/users', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  return listUsers(req, res);
});

router.post('/users/:id/ban', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  return banUser(req, res);
});

router.post('/users/:id/unban', (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  return unbanUser(req, res);
});

// Admins are not allowed to view arbitrary user notes in this application by design.

export default router;
