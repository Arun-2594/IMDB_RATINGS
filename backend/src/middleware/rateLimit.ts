import rateLimit from 'express-rate-limit';

/** Movie & reviews endpoints: 60 req / 15 min per IP */
export const movieLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded for movie data. Please try again in a few minutes.',
  },
});

/** Sentiment (Claude API) endpoint: 10 req / 15 min per IP — cost protection */
export const sentimentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'AI analysis rate limit exceeded. Please wait before analyzing another movie.',
  },
});

/** General API limiter */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again in 15 minutes.',
  },
});
