import { Router } from 'express';
import {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
} from '@/controllers/notesController';
import { requireAuth } from '@/middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', createNote);
router.get('/', listNotes);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
