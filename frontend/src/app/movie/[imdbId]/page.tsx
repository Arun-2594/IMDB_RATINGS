"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { MovieCard } from "@/components/MovieCard";
import { SentimentInsights } from "@/components/SentimentInsights";
import { AnalysisTerminal } from "@/components/AnalysisTerminal";
import { ErrorCard } from "@/components/ErrorCard";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://imdbratings-production.up.railway.app";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://imdbratings-production.up.railway.app";

interface MovieData {
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

interface SentimentData {
  summary: string;
  themes: string[];
  positiveHighlights?: string[];
  negativePoints?: string[];
  sentiment: "POSITIVE" | "MIXED" | "NEGATIVE";
  score: number;
  breakdown?: {
    positive: number;
    mixed: number;
    negative: number;
  };
  audienceProfile?: string;
  rewatch?: string;
  oneLineVerdict?: string;
}

interface AnalysisStep {
  step: string;
  status: "waiting" | "loading" | "done" | "error";
  progress: number;
  message?: string;
}

interface AnalysisCompleteData {
  movie: MovieData;
  reviews: string[];
  sentiment: SentimentData | null;
}

const defaultSteps: AnalysisStep[] = [
  {
    step: "metadata",
    status: "waiting",
    progress: 0,
    message: "Fetching movie metadata...",
  },
  {
    step: "poster",
    status: "waiting",
    progress: 0,
    message: "Loading poster and cast...",
  },
  {
    step: "reviews",
    status: "waiting",
    progress: 0,
    message: "Scraping audience reviews...",
  },
  {
    step: "ai",
    status: "waiting",
    progress: 0,
    message: "Running Claude AI analysis...",
  },
  {
    step: "report",
    status: "waiting",
    progress: 0,
    message: "Building sentiment report...",
  },
];

export default function MoviePage() {
  const params = useParams();
  const router = useRouter();
  const imdbId = params.imdbId as string;

  const [movie, setMovie] = useState<MovieData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [reviews, setReviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisSteps, setAnalysisSteps] =
    useState<AnalysisStep[]>(defaultSteps);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Socket.io connection and analysis
  useEffect(() => {
    if (!imdbId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("analysis:start", { imdbId });
    });

    socket.on(
      "analysis:step",
      (data: {
        step: string;
        status: string;
        progress: number;
        message?: string;
      }) => {
        setAnalysisSteps((prev) =>
          prev.map((s) =>
            s.step === data.step
              ? {
                ...s,
                status: data.status as AnalysisStep["status"],
                progress: data.progress,
                message: data.message || s.message,
              }
              : s
          )
        );
        setOverallProgress(data.progress);
      }
    );

    socket.on(
      "analysis:complete",
      ({ data }: { data: AnalysisCompleteData }) => {
        setMovie(data.movie);
        setReviews(data.reviews || []);
        setSentiment(data.sentiment);
        setOverallProgress(100);

        // Save to recent searches
        try {
          const stored = localStorage.getItem("cinescope-recent");
          const recent = stored ? JSON.parse(stored) : [];
          const filtered = recent.filter(
            (r: { id: string }) => r.id !== imdbId
          );
          filtered.unshift({
            id: imdbId,
            title: data.movie.title,
            timestamp: Date.now(),
          });
          localStorage.setItem(
            "cinescope-recent",
            JSON.stringify(filtered.slice(0, 10))
          );
        } catch {
          // Ignore localStorage errors
        }

        // Delay hiding terminal for smooth transition
        setTimeout(() => setIsAnalyzing(false), 800);
      }
    );

    socket.on(
      "analysis:error",
      ({ message }: { message: string }) => {
        setError(message);
        setIsAnalyzing(false);
      }
    );

    socket.on("connect_error", () => {
      // Fallback to REST API if socket fails
      fallbackToRest();
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imdbId]);

  // Scroll detection for floating bar
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowFloatingBar(heroBottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fallbackToRest = useCallback(async () => {
    try {
      setAnalysisSteps((prev) =>
        prev.map((s) =>
          s.step === "metadata"
            ? { ...s, status: "loading", progress: 10 }
            : s
        )
      );
      setOverallProgress(10);

      const movieRes = await fetch(`${API_URL}/api/movie/${imdbId}`);
      const movieJson = await movieRes.json();

      if (!movieRes.ok) throw new Error(movieJson.message || "Movie not found");

      const movieData: MovieData = movieJson.data;
      setMovie(movieData);
      setAnalysisSteps((prev) =>
        prev.map((s) =>
          s.step === "metadata" || s.step === "poster"
            ? {
              ...s,
              status: "done",
              progress: s.step === "metadata" ? 25 : 35,
            }
            : s
        )
      );
      setOverallProgress(35);

      setAnalysisSteps((prev) =>
        prev.map((s) =>
          s.step === "reviews" ? { ...s, status: "loading", progress: 40 } : s
        )
      );

      const reviewsRes = await fetch(`${API_URL}/api/reviews/${imdbId}`);
      const reviewsJson = await reviewsRes.json();
      const fetchedReviews: string[] = reviewsJson.data?.reviews || [];
      setReviews(fetchedReviews);

      setAnalysisSteps((prev) =>
        prev.map((s) =>
          s.step === "reviews" ? { ...s, status: "done", progress: 60 } : s
        )
      );
      setOverallProgress(60);

      if (fetchedReviews.length > 0) {
        setAnalysisSteps((prev) =>
          prev.map((s) =>
            s.step === "ai" ? { ...s, status: "loading", progress: 65 } : s
          )
        );

        const sentimentRes = await fetch(`${API_URL}/api/sentiment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviews: fetchedReviews,
            movieTitle: movieData.title,
          }),
        });

        const sentimentJson = await sentimentRes.json();
        if (sentimentRes.ok) {
          setSentiment(sentimentJson.data);
        }

        setAnalysisSteps((prev) =>
          prev.map((s) =>
            s.step === "ai" || s.step === "report"
              ? { ...s, status: "done", progress: s.step === "ai" ? 95 : 100 }
              : s
          )
        );
        setOverallProgress(100);
      } else {
        setAnalysisSteps((prev) =>
          prev.map((s) =>
            s.step === "ai" || s.step === "report"
              ? { ...s, status: "done", progress: 100 }
              : s
          )
        );
        setOverallProgress(100);
      }

      // Save recent
      try {
        const stored = localStorage.getItem("cinescope-recent");
        const recent = stored ? JSON.parse(stored) : [];
        const filtered = recent.filter(
          (r: { id: string }) => r.id !== imdbId
        );
        filtered.unshift({
          id: imdbId,
          title: movieData.title,
          timestamp: Date.now(),
        });
        localStorage.setItem(
          "cinescope-recent",
          JSON.stringify(filtered.slice(0, 10))
        );
      } catch {
        // ignore
      }

      setTimeout(() => setIsAnalyzing(false), 600);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setIsAnalyzing(false);
    }
  }, [imdbId]);

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(imdbId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [imdbId]);

  if (error) {
    return (
      <ErrorCard
        title="Analysis Failed"
        message={error}
        onRetry={() => window.location.reload()}
        onBack={() => router.push("/")}
      />
    );
  }

  // Analyzing state - show terminal
  if (isAnalyzing) {
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden flex items-center justify-center px-4">
        <div className="aurora-bg" />
        <div className="hero-glow glow-purple" />
        <div className="hero-glow glow-cyan" />

        <div className="relative z-10 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
                }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-white/80">
                CineScope AI
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Analyzing Movie
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Please wait while we gather intelligence...
            </p>
          </motion.div>

          <AnalysisTerminal
            imdbId={imdbId}
            steps={analysisSteps}
            overallProgress={overallProgress}
          />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <ErrorCard
        title="Movie Not Found"
        message="Unable to load movie data."
        onRetry={() => window.location.reload()}
        onBack={() => router.push("/")}
      />
    );
  }

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <div className="aurora-bg" />

      {/* Cinematic Banner */}
      {movie.poster && (
        <div className="cinematic-banner h-[50vh] sm:h-[60vh] relative" ref={heroRef}>
          <Image
            src={movie.poster}
            alt={`${movie.title} background`}
            fill
            className="object-cover object-top"
            style={{ filter: "blur(25px) brightness(0.3) saturate(1.5)" }}
            priority
          />
          <div className="absolute inset-0 z-[2] flex items-end pb-12 sm:pb-16">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8"
              >
                {/* Small poster */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="w-32 sm:w-40 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 border-2 border-white/10 hidden sm:block"
                >
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    width={160}
                    height={240}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>

                {/* Title Info */}
                <div className="flex-1">
                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {movie.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                    <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/20 rounded-lg px-2.5 py-1">
                      <svg
                        className="w-4 h-4 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-amber-300 font-bold font-mono">
                        {movie.imdbRating}
                      </span>
                    </div>
                    <span>{movie.rated}</span>
                    <span>•</span>
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.runtime}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {movie.genre.map((g, i) => (
                      <motion.span
                        key={g}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.06 }}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white/80 backdrop-blur-sm"
                      >
                        {g}
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-sm text-white/50 mt-3">
                    Director:{" "}
                    <span className="text-white/70">{movie.director}</span>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header (shown when no poster/banner) */}
        {!movie.poster && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 sm:mb-10"
          >
            <button
              onClick={() => router.push("/")}
              id="back-home-button"
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors duration-300 group"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Analyze Another</span>
            </button>
            <div className="flex items-center gap-2" id="cinescope-logo">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
                }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <span className="text-sm font-bold text-white/80">
                CineScope AI
              </span>
            </div>
          </motion.div>
        )}

        {/* Content Grid — Staggered entrance */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
        >
          {/* Left Column — Movie Info */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <MovieCard movie={movie} />
          </motion.div>

          {/* Right Column — Plot + AI Insights */}
          <div className="lg:col-span-8 space-y-6">
            {/* Plot Summary */}
            <motion.div
              variants={itemVariants}
              className="card-glass rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[var(--accent-cyan)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span style={{ fontFamily: "'Syne', sans-serif" }}>
                  Plot Summary
                </span>
              </h2>
              <p className="text-white/70 leading-relaxed">{movie.plot}</p>
            </motion.div>

            {/* AI Insights */}
            <motion.div variants={itemVariants}>
              {sentiment && <SentimentInsights data={sentiment} />}
            </motion.div>

            {/* No Reviews Warning */}
            {!sentiment && reviews.length === 0 && (
              <motion.div
                variants={itemVariants}
                className="card-glass rounded-2xl p-6 border border-amber-500/20"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-amber-300 mb-1">
                      AI Analysis Unavailable
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      No reviews found for this movie. AI analysis requires at
                      least one audience review.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ratings Comparison */}
            {movie.ratings.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="card-glass rounded-2xl p-6"
              >
                <h3
                  className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-5 font-mono"
                >
                  Ratings Comparison
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {movie.ratings.map((rating, i) => (
                    <motion.div
                      key={rating.source}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/60 border border-[var(--border)] hover:border-[var(--accent-purple)]/20 transition-all duration-300"
                    >
                      <p className="text-2xl font-bold text-white mb-1 font-mono">
                        {rating.value}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {rating.source}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Movie Details Grid */}
            <motion.div
              variants={itemVariants}
              className="card-glass rounded-2xl p-6"
            >
              <h3
                className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-5 font-mono"
              >
                Movie Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Released", value: movie.released },
                  { label: "Runtime", value: movie.runtime },
                  { label: "Language", value: movie.language },
                  { label: "Country", value: movie.country },
                ]
                  .filter((d) => d.value && d.value !== "N/A")
                  .map((detail) => (
                    <div key={detail.label}>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-mono mb-0.5">
                        {detail.label}
                      </p>
                      <p className="text-sm text-white/80 font-medium">
                        {detail.value}
                      </p>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="floating-bar"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                {copied ? "Copied!" : "Copy ID"}
              </button>

              <a
                href={`https://www.imdb.com/title/${imdbId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                IMDb
              </a>

              <div className="w-px h-5 bg-[var(--border)]" />

              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-[var(--accent-purple)]/15 text-[var(--accent-purple)] hover:bg-[var(--accent-purple)]/25 transition-all duration-200"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                New Analysis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
