import { Request, Response, NextFunction } from 'express';

/**
 * Validates that the IMDb ID matches the expected pattern: tt followed by 7-8 digits
 */
export const IMDB_ID_REGEX = /^tt\d{7,10}$/;

export function validateImdbId(req: Request, res: Response, next: NextFunction): void {
  const imdbId = req.params.imdbId as string;

  if (!imdbId) {
    res.status(400).json({
      error: 'Missing IMDb ID',
      message: 'Please provide a valid IMDb ID (e.g., tt0133093)',
    });
    return;
  }

  if (!IMDB_ID_REGEX.test(imdbId)) {
    res.status(400).json({
      error: 'Invalid IMDb ID format',
      message: 'IMDb ID must start with "tt" followed by 7 or 8 digits (e.g., tt0133093)',
    });
    return;
  }

  next();
}

export function validateSentimentBody(req: Request, res: Response, next: NextFunction): void {
  const { reviews, movieTitle } = req.body;

  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    res.status(400).json({
      error: 'Invalid reviews',
      message: 'Please provide a non-empty array of review strings',
    });
    return;
  }

  if (!movieTitle || typeof movieTitle !== 'string' || movieTitle.trim().length === 0) {
    res.status(400).json({
      error: 'Invalid movie title',
      message: 'Please provide a valid movie title string',
    });
    return;
  }

  // Ensure all reviews are strings
  const validReviews = reviews.every((r: unknown) => typeof r === 'string' && r.trim().length > 0);
  if (!validReviews) {
    res.status(400).json({
      error: 'Invalid review entries',
      message: 'All reviews must be non-empty strings',
    });
    return;
  }

  next();
}
