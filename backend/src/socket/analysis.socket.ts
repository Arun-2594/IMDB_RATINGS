import { Server, Socket } from 'socket.io';
import { fetchMovieData } from '../services/omdb';
import { scrapeImdbReviews } from '../services/scraper';
import { analyzeSentiment } from '../services/gemini';
import { getCached, setCache, cacheKey } from '../services/cache';
import { logger } from '../middleware/logger';
import { MovieData } from '../types/movie.types';
import { SentimentResult, AnalysisCompletePayload } from '../types/sentiment.types';

const IMDB_ID_REGEX = /^tt\d{7,10}$/;

export function setupAnalysisSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('analysis:start', async (data: { imdbId: string }) => {
      const { imdbId } = data;

      if (!imdbId || !IMDB_ID_REGEX.test(imdbId)) {
        socket.emit('analysis:error', {
          message: 'Invalid IMDb ID format',
          code: 'INVALID_ID',
        });
        return;
      }

      try {
        // Check full cache first
        const cachedResult = getCached<AnalysisCompletePayload>(cacheKey('analysis', imdbId));
        if (cachedResult) {
          logger.info(`Cache hit for analysis:${imdbId}`);
          socket.emit('analysis:step', { step: 'metadata', status: 'done', progress: 25 });
          socket.emit('analysis:step', { step: 'poster', status: 'done', progress: 35 });
          socket.emit('analysis:step', { step: 'reviews', status: 'done', progress: 60 });
          socket.emit('analysis:step', { step: 'ai', status: 'done', progress: 95 });
          socket.emit('analysis:step', { step: 'report', status: 'done', progress: 100 });
          socket.emit('analysis:complete', { data: cachedResult });
          return;
        }

        // Step 1: Fetch metadata
        socket.emit('analysis:step', {
          step: 'metadata',
          status: 'loading',
          progress: 10,
          message: 'Fetching movie metadata...',
        });

        let movie: MovieData;
        const cachedMovie = getCached<MovieData>(cacheKey('movie', imdbId));
        if (cachedMovie) {
          movie = cachedMovie;
        } else {
          movie = await fetchMovieData(imdbId);
          setCache(cacheKey('movie', imdbId), movie);
        }

        socket.emit('analysis:step', {
          step: 'metadata',
          status: 'done',
          progress: 25,
          message: `Found: ${movie.title} (${movie.year})`,
        });

        // Step 2: Poster loaded (already in movie data)
        socket.emit('analysis:step', {
          step: 'poster',
          status: 'done',
          progress: 35,
          message: 'Poster and cast loaded',
        });

        // Step 3: Scrape reviews
        socket.emit('analysis:step', {
          step: 'reviews',
          status: 'loading',
          progress: 40,
          message: 'Scraping audience reviews...',
        });

        let reviews: string[];
        const cachedReviews = getCached<string[]>(cacheKey('reviews', imdbId));
        if (cachedReviews) {
          reviews = cachedReviews;
        } else {
          reviews = await scrapeImdbReviews(imdbId);
          setCache(cacheKey('reviews', imdbId), reviews);
        }

        socket.emit('analysis:step', {
          step: 'reviews',
          status: 'done',
          progress: 60,
          message: `Found ${reviews.length} audience reviews`,
        });

        if (reviews.length === 0) {
          socket.emit('analysis:complete', {
            data: {
              movie,
              reviews: [],
              sentiment: null,
            },
          });
          return;
        }

        // Step 4: Claude AI analysis
        socket.emit('analysis:step', {
          step: 'ai',
          status: 'loading',
          progress: 65,
          message: 'Running Claude AI sentiment analysis...',
        });

        const sentiment: SentimentResult = await analyzeSentiment(
          reviews,
          movie.title,
          movie.year
        );

        socket.emit('analysis:step', {
          step: 'ai',
          status: 'done',
          progress: 95,
          message: `Sentiment: ${sentiment.sentiment} (${sentiment.score}/100)`,
        });

        // Step 5: Build report
        socket.emit('analysis:step', {
          step: 'report',
          status: 'done',
          progress: 100,
          message: 'Intelligence report ready',
        });

        const payload: AnalysisCompletePayload = { movie, reviews, sentiment };

        // Cache the full result
        setCache(cacheKey('analysis', imdbId), payload);

        socket.emit('analysis:complete', { data: payload });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Analysis failed';
        logger.error(`Analysis error for ${imdbId}: ${message}`);
        socket.emit('analysis:error', { message, code: 'ANALYSIS_FAILED' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}
