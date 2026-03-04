"use client";

import { motion } from "framer-motion";

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorCard({
  title = "Something went wrong",
  message,
  onRetry,
  onBack,
}: ErrorCardProps) {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden flex items-center justify-center px-4">
      <div className="aurora-bg" />
      <div className="hero-glow glow-purple" />
      <div className="hero-glow glow-cyan" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 card-glass rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center"
      >
        {/* Error icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </motion.div>

        <h2
          className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              id="retry-button"
              className="btn-primary text-white font-semibold px-6 py-3 rounded-xl"
            >
              Try Again
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              id="back-button"
              className="btn-secondary px-6 py-3 rounded-xl font-semibold"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
