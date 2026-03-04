import { Router, Request, Response } from 'express';
import { validateSentimentBody } from '../middleware/validate';
import { analyzeSentiment } from '../services/claude';

const router = Router();

/**
 * POST /api/sentiment
 * Analyze reviews using Claude AI
 * Body: { reviews: string[], movieTitle: string }
 */
router.post('/', validateSentimentBody, async (req: Request, res: Response) => {
  try {
    const { reviews, movieTitle } = req.body;

    const result = await analyzeSentiment(reviews, movieTitle);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to analyze sentiment';

    if (message.includes('not configured')) {
      console.error('Configuration error:', message);
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'AI sentiment analysis is not available. Please check server configuration.',
      });
      return;
    }

    console.error('Sentiment analysis error:', message);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: 'Failed to analyze sentiment. Please try again later.',
    });
  }
});

export default router;
