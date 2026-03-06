import axios from 'axios';

export interface OmdbMovieResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
}

export interface MovieData {
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string[];
  director: string;
  writer: string;
  cast: string[];
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  ratings: Array<{ source: string; value: string }>;
  metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbId: string;
  boxOffice: string;
}

/**
 * Parse raw OMDB API response into a clean MovieData object
 */
export function parseOmdbResponse(data: OmdbMovieResponse): MovieData {
  return {
    title: data.Title || 'Unknown',
    year: data.Year || 'N/A',
    rated: data.Rated || 'N/A',
    released: data.Released || 'N/A',
    runtime: data.Runtime || 'N/A',
    genre: data.Genre ? data.Genre.split(', ').map((g) => g.trim()) : [],
    director: data.Director || 'Unknown',
    writer: data.Writer || 'Unknown',
    cast: data.Actors ? data.Actors.split(', ').map((a) => a.trim()) : [],
    plot: data.Plot || 'No plot available.',
    language: data.Language || 'N/A',
    country: data.Country || 'N/A',
    awards: data.Awards || 'N/A',
    poster: data.Poster !== 'N/A' ? data.Poster : '',
    ratings: (data.Ratings || []).map((r) => ({
      source: r.Source,
      value: r.Value,
    })),
    metascore: data.Metascore || 'N/A',
    imdbRating: data.imdbRating || 'N/A',
    imdbVotes: data.imdbVotes || 'N/A',
    imdbId: data.imdbID || '',
    boxOffice: data.BoxOffice || 'N/A',
  };
}

/**
 * Fetch movie metadata from OMDB API
 */
export async function fetchMovieData(imdbId: string): Promise<MovieData> {
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    throw new Error('OMDB_API_KEY is not configured');
  }

  const url = `http://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}&plot=full`;

  const response = await axios.get<OmdbMovieResponse>(url, { timeout: 10000 });

  if (response.data.Response === 'False') {
    throw new Error(response.data.Error || 'Movie not found');
  }

  return parseOmdbResponse(response.data);
}

/**
 * Search for a movie by title and return its IMDb ID
 */
export async function searchMovieByTitle(title: string): Promise<string> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) throw new Error('OMDB_API_KEY is not configured');

  const url = `http://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${apiKey}`;
  const response = await axios.get(url, { timeout: 10000 });

  if (response.data.Response === 'False') {
    throw new Error(response.data.Error || 'Movie not found');
  }

  // Return the first result's ID
  const firstResult = response.data.Search?.[0];
  if (!firstResult || !firstResult.imdbID) {
    throw new Error('Movie not found');
  }

  return firstResult.imdbID;
}
