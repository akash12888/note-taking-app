import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';


interface CustomError extends Error {
  statusCode?: number;

}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
 
  console.error(err);

  // Create a default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';


  if (err instanceof mongoose.Error.CastError && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  else if ((err as any).code === 11000) {
    statusCode = 400;

    const key = Object.keys((err as any).keyValue || {}).join(', ');
    message = `Duplicate field value entered${key ? ` for ${key}` : ''}`;
  }

  // Validation error
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;

    message = Object.values(err.errors).map(e => e.message).join('. ');
  }

  res.status(statusCode).json({
    success: false,
    message
 
  });
};

export default errorHandler;
