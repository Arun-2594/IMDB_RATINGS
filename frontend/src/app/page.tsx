"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(
  () =>
    import("@/components/ParticleBackground").then(
      (mod) => mod.ParticleBackground
    ),
  { ssr: false }
);

const IMDB_ID_REGEX = /^tt\d{7,10}$/;

const exampleMovies = [
  { id: "tt0133093", title: "The Matrix" },
  { id: "tt1375666", title: "Inception" },
  { id: "tt0816692", title: "Interstellar" },
  { id: "tt0068646", title: "The Godfather" },
];

const stats = [
  { value: "10,000+", label: "Movies Analyzed", icon: "🎬" },
  { value: "Claude AI", label: "Powered Analysis", icon: "🤖" },
  { value: "Real-time", label: "Live Insights", icon: "⚡" },
  { value: "<2s", label: "Analysis Speed", icon: "🚀" },
];

const howItWorks = [
  {
    step: "01",
    title: "Enter IMDb ID",
    description: "Paste any valid IMDb ID to begin the analysis process",
    icon: "🔍",
    color: "var(--accent-purple)",
  },
  {
    step: "02",
    title: "AI Analyzes Reviews",
    description:
      "Claude AI processes audience reviews with advanced sentiment detection",
    icon: "🧠",
    color: "var(--accent-cyan)",
  },
  {
    step: "03",
    title: "Get Intelligence Report",
    description:
      "Receive a comprehensive report with themes, sentiment breakdown & insights",
    icon: "📊",
    color: "var(--accent-pink)",
  },
];

interface RecentSearch {
  id: string;
  title: string;
  timestamp: number;
}

export default function HomePage() {
  const [imdbId, setImdbId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cinescope-recent");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmed = imdbId.trim();
      if (!trimmed) {
        setError("Please enter a movie title or IMDb ID");
        return;
      }

      setError("");
      setIsSubmitting(true);
      router.push(`/movie/${encodeURIComponent(trimmed)}`);
    },
    [imdbId, router]
  );

  const handleChipClick = useCallback(
    (id: string) => {
      setImdbId(id);
      setError("");
      setIsSubmitting(true);
      router.push(`/movie/${id}`);
    },
    [router]
  );

  // Split text animation variants
  const headingWords = ["Decode", "the", "Audience", "Mind"];

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Aurora background */}
      <div className="aurora-bg" />

      {/* Three.js Particles */}
      <ParticleBackground />

      {/* Background glows */}
      <div className="hero-glow glow-purple" />
      <div className="hero-glow glow-cyan" />
      <div className="hero-glow glow-pink" />

      {/* Floating Orbs */}
      <motion.div
        animate={{ y: [-15, 15, -15], x: [-5, 5, -5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/6 w-3 h-3 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, var(--accent-purple), transparent)",
        }}
      />
      <motion.div
        animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, var(--accent-cyan), transparent)",
        }}
      />
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/6 w-4 h-4 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, var(--accent-pink), transparent)",
        }}
      />

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
          <div className="max-w-3xl w-full text-center">
            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="ai-badge px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--accent-purple)] font-semibold">
                  ✦ Powered by Claude AI
                </span>
              </div>
            </motion.div>

            {/* Split Text Headline */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {headingWords.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.1,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  className={`inline-block mr-3 sm:mr-4 ${i >= 2
                    ? "bg-gradient-to-r from-[var(--accent-purple)] via-[var(--accent-cyan)] to-[var(--accent-pink)] bg-clip-text text-transparent"
                    : "text-white"
                    }`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-lg sm:text-xl text-[var(--text-secondary)] mb-12 max-w-xl mx-auto leading-relaxed"
            >
              Enter any IMDb ID and get AI-powered sentiment analysis, audience
              insights, and cinematic intelligence.
            </motion.p>

            {/* Premium Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              onSubmit={handleSubmit}
              className="relative max-w-xl mx-auto"
            >
              <div className="relative">
                <div className="flex items-center rounded-2xl overflow-hidden bg-[var(--bg-secondary)]/80 backdrop-blur-xl border border-[var(--border)] focus-within:border-[var(--accent-purple)] focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.15),0_0_30px_rgba(124,58,237,0.2)] transition-all duration-400">
                  {/* Film icon */}
                  <div className="pl-5 text-[var(--text-secondary)]">
                    <svg
                      className="w-5 h-5"
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

                  <input
                    id="imdb-input"
                    type="text"
                    value={imdbId}
                    onChange={(e) => {
                      setImdbId(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="tt0133093"
                    className="flex-1 px-4 py-4 sm:py-5 bg-transparent text-white placeholder:text-[var(--text-secondary)]/50 focus:outline-none text-lg font-mono"
                    autoComplete="off"
                    spellCheck={false}
                  />

                  <button
                    type="submit"
                    id="analyze-button"
                    disabled={isSubmitting}
                    className="btn-primary text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base whitespace-nowrap flex items-center gap-2 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="film-reel-spinner !w-5 !h-5 !border-2" />
                    ) : (
                      <>
                        Analyze
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute -bottom-8 left-4 text-red-400 text-sm font-medium"
                      id="input-error"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.form>

            {/* Example Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-14"
            >
              <p className="text-[var(--text-secondary)] text-sm mb-4 font-medium">
                Try these popular movies
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {exampleMovies.map((movie, i) => (
                  <motion.button
                    key={movie.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + i * 0.08 }}
                    onClick={() => handleChipClick(movie.id)}
                    className="chip px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm font-medium cursor-pointer"
                    id={`chip-${movie.id}`}
                  >
                    <span className="text-[var(--accent-purple)] mr-1.5 font-mono text-xs">
                      {movie.id}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {movie.title}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="relative z-10 py-16 border-y border-[var(--border)]"
        >
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="stat-card text-center"
              >
                <span className="text-2xl mb-2 block">{stat.icon}</span>
                <p className="text-2xl sm:text-3xl font-bold text-white font-heading mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How It Works */}
        <section className="relative z-10 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-16"
            >
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                How It Works
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                Three simple steps to unlock audience intelligence for any movie
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {howItWorks.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="card-glass rounded-2xl p-8 text-center group cursor-default"
                >
                  {/* Step number */}
                  <div
                    className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300"
                  >
                    {item.icon}
                  </div>

                  <span
                    className="text-xs font-mono font-bold mb-2 block"
                    style={{ color: item.color }}
                  >
                    STEP {item.step}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative z-10 py-16 border-t border-[var(--border)]"
          >
            <div className="max-w-5xl mx-auto px-4">
              <h3
                className="text-xl font-bold text-white mb-6"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Recent Searches
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                {recentSearches.slice(0, 6).map((search) => (
                  <motion.button
                    key={search.id}
                    whileHover={{ y: -4 }}
                    onClick={() => handleChipClick(search.id)}
                    className="flex-shrink-0 card-glass rounded-xl p-4 min-w-[160px] text-left cursor-pointer hover:border-[var(--accent-purple)]/20 transition-all duration-300"
                  >
                    <p className="text-sm font-semibold text-white truncate">
                      {search.title || search.id}
                    </p>
                    <p className="text-xs font-mono text-[var(--accent-purple)] mt-1">
                      {search.id}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <footer className="relative z-10 py-8 border-t border-[var(--border)]">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
                }}
              >
                <svg
                  className="w-3.5 h-3.5 text-white"
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
              <span className="text-sm font-bold text-white/70">
                CineScope AI
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]/50">
              Powered by OMDB API & Claude AI • Built with Next.js & Three.js
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
