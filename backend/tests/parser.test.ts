import { parseOmdbResponse, OmdbMovieResponse } from '../src/services/omdb';
import { parseSentimentResponse } from '../src/services/claude';

describe('OMDB Response Parser', () => {
  const validResponse: OmdbMovieResponse = {
    Title: 'The Matrix',
    Year: '1999',
    Rated: 'R',
    Released: '31 Mar 1999',
    Runtime: '136 min',
    Genre: 'Action, Sci-Fi',
    Director: 'Lana Wachowski, Lilly Wachowski',
    Writer: 'Lilly Wachowski, Lana Wachowski',
    Actors: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss',
    Plot: 'A computer hacker learns about the true nature of reality.',
    Language: 'English',
    Country: 'United States, Australia',
    Awards: 'Won 4 Oscars.',
    Poster: 'https://example.com/poster.jpg',
    Ratings: [
      { Source: 'Internet Movie Database', Value: '8.7/10' },
      { Source: 'Rotten Tomatoes', Value: '88%' },
    ],
    Metascore: '73',
    imdbRating: '8.7',
    imdbVotes: '1,900,000',
    imdbID: 'tt0133093',
    Type: 'movie',
    DVD: '21 Sep 1999',
    BoxOffice: '$171,479,930',
    Production: 'N/A',
    Website: 'N/A',
    Response: 'True',
  };

  test('should correctly parse a valid OMDB response', () => {
    const result = parseOmdbResponse(validResponse);

    expect(result.title).toBe('The Matrix');
    expect(result.year).toBe('1999');
    expect(result.imdbRating).toBe('8.7');
    expect(result.imdbId).toBe('tt0133093');
  });

  test('should split genre into array', () => {
    const result = parseOmdbResponse(validResponse);
    expect(result.genre).toEqual(['Action', 'Sci-Fi']);
  });

  test('should split cast into array', () => {
    const result = parseOmdbResponse(validResponse);
    expect(result.cast).toEqual(['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss']);
  });

  test('should map ratings correctly', () => {
    const result = parseOmdbResponse(validResponse);
    expect(result.ratings).toHaveLength(2);
    expect(result.ratings[0].source).toBe('Internet Movie Database');
    expect(result.ratings[0].value).toBe('8.7/10');
  });

  test('should handle missing fields with defaults', () => {
    const partial: OmdbMovieResponse = {
      ...validResponse,
      Title: '',
      Genre: '',
      Actors: '',
      Poster: 'N/A',
      Ratings: [],
    };

    const result = parseOmdbResponse(partial);

    expect(result.title).toBe('Unknown');
    expect(result.genre).toEqual([]);
    expect(result.cast).toEqual([]);
    expect(result.poster).toBe('');
    expect(result.ratings).toEqual([]);
  });
});

describe('Sentiment Response Parser', () => {
  test('should parse valid JSON response', () => {
    const response = JSON.stringify({
      summary: 'Audiences love this movie. The acting is superb. The plot is engaging.',
      themes: ['Great acting', 'Compelling story', 'Visual effects'],
      sentiment: 'POSITIVE',
      score: 8,
    });

    const result = parseSentimentResponse(response);

    expect(result.summary).toContain('Audiences love');
    expect(result.themes).toHaveLength(3);
    expect(result.sentiment).toBe('POSITIVE');
    expect(result.score).toBe(8);
  });

  test('should parse JSON wrapped in markdown code block', () => {
    const response = '```json\n{\n  "summary": "Mixed reviews overall. Some liked it. Some did not.",\n  "themes": ["Divisive"],\n  "sentiment": "MIXED",\n  "score": 5\n}\n```';

    const result = parseSentimentResponse(response);

    expect(result.sentiment).toBe('MIXED');
    expect(result.score).toBe(5);
  });

  test('should limit themes to 5', () => {
    const response = JSON.stringify({
      summary: 'Summary text here. Second sentence. Third sentence.',
      themes: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
      sentiment: 'POSITIVE',
      score: 9,
    });

    const result = parseSentimentResponse(response);
    expect(result.themes.length).toBeLessThanOrEqual(5);
  });

  test('should clamp score between 1 and 10', () => {
    const response = JSON.stringify({
      summary: 'Summary. Sentence two. Sentence three.',
      themes: ['Theme'],
      sentiment: 'NEGATIVE',
      score: 2,
    });

    const result = parseSentimentResponse(response);
    expect(result.score).toBeGreaterThanOrEqual(1);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  test('should throw on completely invalid response', () => {
    expect(() => parseSentimentResponse('This is not JSON at all')).toThrow();
  });
});
