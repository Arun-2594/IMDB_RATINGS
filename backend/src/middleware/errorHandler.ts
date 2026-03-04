import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });

  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Cross-origin request not allowed.',
    });
    return;
  }

  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid request data format.',
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred. Please try again later.',
  });
}
