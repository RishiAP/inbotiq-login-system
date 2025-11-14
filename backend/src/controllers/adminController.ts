import { Response } from 'express';
import User, { IUser } from '@/models/User';
import { FilterQuery, SortOrder } from 'mongoose';
import { connect } from '@/lib/db';
import { AuthRequest } from '@/middleware/auth';

export async function listUsers(req: AuthRequest, res: Response) {
  try {
    await connect();
    // only admins may list users
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const q = (req.query.q as string) || '';
  const role = (req.query.role as string) || '';
  const banned = req.query.banned as string | undefined;
  const createdFrom = (req.query.createdFrom as string) || '';
  const createdTo = (req.query.createdTo as string) || '';
  const updatedFrom = (req.query.updatedFrom as string) || '';
  const updatedTo = (req.query.updatedTo as string) || '';
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const order = (req.query.order as string) || 'desc';

    const filter: FilterQuery<IUser> = {};
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
    // Do not return admin users in the admin listing
    if (role && role !== 'admin') {
      filter.role = role;
    } else {
      // Exclude admin users from the listing
      filter.role = { $ne: 'admin' } as unknown as FilterQuery<IUser>['role'];
    }
  if (typeof banned !== 'undefined') filter.banned = banned === 'true';
    // createdAt range filter
    if (createdFrom || createdTo) {
      const range: Partial<Record<'$gte' | '$lte', Date>> = {};
      if (createdFrom) range.$gte = new Date(createdFrom);
      if (createdTo) {
        const d = new Date(createdTo);
        d.setHours(23, 59, 59, 999);
        range.$lte = d;
      }
      // assign to filter using any to avoid strict schema typing issues
  (filter as unknown as Record<string, unknown>).createdAt = range;
    }
    // updatedAt range filter
    if (updatedFrom || updatedTo) {
      const range: Partial<Record<'$gte' | '$lte', Date>> = {};
      if (updatedFrom) range.$gte = new Date(updatedFrom);
      if (updatedTo) {
        const d = new Date(updatedTo);
        d.setHours(23, 59, 59, 999);
        range.$lte = d;
      }
  (filter as unknown as Record<string, unknown>).updatedAt = range;
    }

    const total = await User.countDocuments(filter);
    const sortDirection: SortOrder = order === 'asc' ? 1 : -1;
    const sortObj: Record<string, SortOrder> = {};
    // only allow sorting by these fields to avoid injection
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      sortObj[sortBy] = sortDirection;
    } else {
      sortObj['createdAt'] = -1 as SortOrder;
    }
    const users = await User.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit).select('-password');
    return res.json({ users, page, limit, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function banUser(req: AuthRequest, res: Response) {
  try {
    await connect();
    // only admins may ban users
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot ban admin users' });
    if (req.userId === String(user._id)) return res.status(400).json({ message: 'Cannot ban yourself' });
    user.banned = true;
    await user.save();
    return res.json({ message: 'User banned' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function unbanUser(req: AuthRequest, res: Response) {
  try {
    await connect();
    // only admins may unban users
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot unban admin users' });
    user.banned = false;
    await user.save();
    return res.json({ message: 'User unbanned' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
