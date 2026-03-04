"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface MovieData {
  title: string;
  year: string;
  rated: string;
  runtime: string;
  genre: string[];
  director: string;
  writer?: string;
  cast: string[];
  plot: string;
  poster: string;
  imdbRating: string;
  imdbVotes: string;
  awards: string;
  ratings: Array<{ source: string; value: string }>;
  boxOffice: string;
  language?: string;
  country?: string;
}

interface MovieCardProps {
  movie: MovieData;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="space-y-6">
      {/* Poster with 3D tilt effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="poster-hover rounded-2xl overflow-hidden shadow-2xl relative group"
        style={{ perspective: "1000px" }}
      >
        {movie.poster ? (
          <div className="relative">
            <Image
              src={movie.poster}
              alt={`${movie.title} poster`}
              width={400}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
            {/* Hover overlay with cast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
              <p className="text-xs uppercase tracking-widest text-[var(--accent-cyan)] mb-2 font-mono">
                Cast
              </p>
              <div className="flex flex-wrap gap-1.5">
                {movie.cast.slice(0, 4).map((actor) => (
                  <span
                    key={actor}
                    className="text-xs text-white/80 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-[2/3] bg-[var(--bg-secondary)] flex items-center justify-center rounded-2xl">
            <svg
              className="w-16 h-16 text-[var(--text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
        )}
      </motion.div>

      {/* Movie Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="card-glass rounded-2xl p-6 space-y-5"
      >
        {/* Title & Year */}
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {movie.title}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-[var(--text-secondary)] text-sm">
            <span className="font-mono">{movie.year}</span>
            <span className="text-[var(--border-strong)]">•</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-medium">
              {movie.rated}
            </span>
            <span className="text-[var(--border-strong)]">•</span>
            <span>{movie.runtime}</span>
          </div>
        </div>

        {/* IMDb Rating - Premium Style */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
            <svg
              className="w-6 h-6 text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-amber-300 font-bold text-2xl font-mono">
              {movie.imdbRating}
            </span>
            <span className="text-amber-300/50 text-sm">/10</span>
          </div>
          {movie.imdbVotes && (
            <div className="text-xs text-[var(--text-secondary)]">
              <span className="block font-mono text-white/60">
                {movie.imdbVotes}
              </span>
              <span>votes</span>
            </div>
          )}
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-2">
          {movie.genre.map((g, i) => (
            <motion.span
              key={g}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border border-[var(--accent-purple)]/15"
            >
              {g}
            </motion.span>
          ))}
        </div>

        {/* Director */}
        <div className="pt-2 border-t border-[var(--border)]">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1 font-mono">
            Director
          </p>
          <p className="text-white font-medium">{movie.director}</p>
        </div>

        {/* Cast */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1.5 font-mono">
            Cast
          </p>
          <div className="flex flex-wrap gap-1.5">
            {movie.cast.map((actor) => (
              <span
                key={actor}
                className="text-xs text-white/70 bg-white/5 rounded-md px-2 py-1"
              >
                {actor}
              </span>
            ))}
          </div>
        </div>

        {/* Awards */}
        {movie.awards && movie.awards !== "N/A" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 rounded-xl p-4"
          >
            <span className="text-xl">🏆</span>
            <p className="text-sm text-amber-200/80 leading-relaxed">
              {movie.awards}
            </p>
          </motion.div>
        )}

        {/* Box Office & Details */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
          {movie.boxOffice && movie.boxOffice !== "N/A" && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-mono mb-0.5">
                Box Office
              </p>
              <p className="text-[var(--accent-cyan)] font-bold text-sm font-mono">
                {movie.boxOffice}
              </p>
            </div>
          )}
          {movie.language && movie.language !== "N/A" && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-mono mb-0.5">
                Language
              </p>
              <p className="text-white/70 text-sm">{movie.language}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
