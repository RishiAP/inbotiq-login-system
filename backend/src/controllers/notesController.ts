import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import Note, { INote } from '../models/Note';
import { connect } from '../lib/db';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Create a note. If admin passes userId in body they can create for that user, otherwise for self.
export async function createNote(req: AuthRequest, res: Response) {
  try {
    await connect();
    const { content, userId } = req.body as { content?: string; userId?: string };
    if (!content) return res.status(400).json({ message: 'Content required' });

    // If admin and provided userId, allow creating for that user. Otherwise force owner.
    let targetUser = req.userId;
    if (req.userRole === 'admin' && userId) targetUser = userId;

    const user = await User.findById(targetUser);
    if (!user) return res.status(404).json({ message: 'Target user not found' });

    // Prevent banned users from creating notes for themselves
    if (req.userRole !== 'admin' && (user as IUser).banned) {
      return res.status(403).json({ message: 'Banned users cannot create notes' });
    }

    const note = await Note.create({ user: user._id, author: req.userId, content });
    return res.status(201).json({ note });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// List notes for current user (or when admin, for any user via query userId). Supports search & pagination.
export async function listNotes(req: AuthRequest, res: Response) {
  try {
    await connect();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const q = (req.query.q as string) || '';
    const forUser = (req.query.userId as string) || (req.userId as string);

    // If non-admin attempts to list another user's notes, forbid
    if (forUser !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 1 : -1;

    const filter: FilterQuery<INote> = { user: forUser };
    if (q) filter.content = new RegExp(q, 'i');

    // Date range filters
    const createdFrom = req.query.createdFrom as string | undefined;
    const createdTo = req.query.createdTo as string | undefined;
    const updatedFrom = req.query.updatedFrom as string | undefined;
    const updatedTo = req.query.updatedTo as string | undefined;

    if (createdFrom || createdTo) {
      const createdRange: { $gte?: Date; $lte?: Date } = {};
      if (createdFrom) createdRange.$gte = new Date(createdFrom);
      if (createdTo) {
        const d = new Date(createdTo);
        d.setHours(23, 59, 59, 999);
        createdRange.$lte = d;
      }
      filter.createdAt = createdRange as FilterQuery<INote>['createdAt'];
    }
    if (updatedFrom || updatedTo) {
      const updatedRange: { $gte?: Date; $lte?: Date } = {};
      if (updatedFrom) updatedRange.$gte = new Date(updatedFrom);
      if (updatedTo) {
        const d = new Date(updatedTo);
        d.setHours(23, 59, 59, 999);
        updatedRange.$lte = d;
      }
      filter.updatedAt = updatedRange as FilterQuery<INote>['updatedAt'];
    }

    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit);

    // Return notes as-is (do not expose author details here by default)
    return res.json({ notes, page, limit, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getNote(req: AuthRequest, res: Response) {
  try {
    await connect();
    const id = req.params.id;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json({ note });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateNote(req: AuthRequest, res: Response) {
  try {
    await connect();
    const id = req.params.id;
    const { content } = req.body as { content?: string };
    if (!content) return res.status(400).json({ message: 'Content required' });

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    note.content = content;
    await note.save();
    return res.json({ note });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteNote(req: AuthRequest, res: Response) {
  try {
    await connect();
    const id = req.params.id;
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

  // Use deleteOne for clarity and compatibility
  await note.deleteOne();
  return res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}
