import { Router, Request, Response } from 'express';
import { validateImdbId } from '../middleware/validate';
import { scrapeImdbReviews } from '../services/scraper';

const router = Router();

/**
 * GET /api/reviews/:imdbId
 * Scrape top audience reviews from IMDb
 */
router.get('/:imdbId', validateImdbId, async (req: Request, res: Response) => {
  try {
    const imdbId = req.params.imdbId as string;
    const reviews = await scrapeImdbReviews(imdbId);

    if (reviews.length === 0) {
      res.json({
        success: true,
        data: {
          reviews: [],
          count: 0,
          message: 'No reviews found. The movie may have no user reviews yet, or IMDb page structure may have changed.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        reviews,
        count: reviews.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to scrape reviews';

    if (message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message,
      });
      return;
    }

    console.error('Review scrape error:', message);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to fetch reviews. Please try again later.',
    });
  }
});

export default router;
