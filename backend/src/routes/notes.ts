import express from 'express';
import { createNote, getNotes, deleteNote } from '../controllers/noteController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.use(authenticateJWT);

router.post('/', createNote);
router.get('/', getNotes);
router.delete('/:id', deleteNote);

export default router;
