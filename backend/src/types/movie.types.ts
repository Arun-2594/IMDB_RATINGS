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

export interface ReviewsData {
  reviews: string[];
  count: number;
}
