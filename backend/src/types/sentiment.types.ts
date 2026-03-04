export interface SentimentResult {
  summary: string;
  themes: string[];
  positiveHighlights: string[];
  negativePoints: string[];
  sentiment: 'POSITIVE' | 'MIXED' | 'NEGATIVE';
  score: number;
  breakdown: {
    positive: number;
    mixed: number;
    negative: number;
  };
  audienceProfile: string;
  rewatch: 'high' | 'medium' | 'low';
  oneLineVerdict: string;
}

export interface AnalysisStep {
  step: 'metadata' | 'poster' | 'reviews' | 'ai' | 'report';
  status: 'waiting' | 'loading' | 'done' | 'error';
  progress: number;
  message?: string;
}

export interface AnalysisCompletePayload {
  movie: import('./movie.types').MovieData;
  reviews: string[];
  sentiment: SentimentResult;
}
