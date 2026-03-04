import { Router, Request, Response } from 'express';
import { validateImdbId } from '../middleware/validate';
import { fetchMovieData } from '../services/omdb';

const router = Router();

/**
 * GET /api/movie/:imdbId
 * Fetch movie metadata from OMDB API
 */
router.get('/:imdbId', validateImdbId, async (req: Request, res: Response) => {
  try {
    const imdbId = req.params.imdbId as string;
    const movieData = await fetchMovieData(imdbId);

    res.json({
      success: true,
      data: movieData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch movie data';

    if (message.includes('not found') || message.includes('Incorrect IMDb ID')) {
      res.status(404).json({
        success: false,
        error: 'Movie not found',
        message: `No movie found with IMDb ID: ${req.params.imdbId}`,
      });
      return;
    }

    console.error('Movie fetch error:', message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to fetch movie data. Please try again later.',
    });
  }
});

export default router;
