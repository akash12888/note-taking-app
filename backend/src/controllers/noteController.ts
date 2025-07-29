import { Request, Response, NextFunction } from 'express';
import Note from '../models/Note';
import { CreateNoteData } from '../types/note';
import { validateNote } from '../utils/validators';

const getAuthenticatedUser = (req: Request): any => {
  return (req as any).user;
};

export const createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = validateNote(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        errorType: 'validation_error',
        message: error.details[0].message
      });
      return;
    }

    const { title, content }: CreateNoteData = req.body;
    const user = getAuthenticatedUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        errorType: 'auth_error',
        message: 'User not authenticated'
      });
      return;
    }

    const userId = user._id || user.id;

    const note = new Note({
      title,
      content,
      userId
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        errorType: 'auth_error',
        message: 'User not authenticated'
      });
      return;
    }

    const userId = user._id || user.id;
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notes: notes.map(note => ({
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    });

  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = getAuthenticatedUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        errorType: 'auth_error',
        message: 'User not authenticated'
      });
      return;
    }

    const userId = user._id || user.id;
    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      res.status(404).json({
        success: false,
        errorType: 'not_found',
        message: 'Note not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};
