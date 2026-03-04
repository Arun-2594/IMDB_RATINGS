"use client";

import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <div className="aurora-bg" />
      <div className="hero-glow glow-purple" />
      <div className="hero-glow glow-cyan" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="skeleton h-5 w-44" />
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-7 w-7 rounded-lg" />
            <div className="skeleton h-4 w-24" />
          </div>
        </div>

        {/* Film Reel Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <div className="film-reel-spinner" />
          <div>
            <p className="text-white font-semibold text-lg">
              Loading Movie Data
            </p>
            <p className="text-[var(--text-secondary)] text-sm">
              Fetching cinematic intelligence...
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Poster skeleton */}
            <div className="skeleton w-full aspect-[2/3] rounded-2xl" />

            {/* Info skeleton */}
            <div className="card-glass rounded-2xl p-6 space-y-4">
              <div className="skeleton h-8 w-3/4 rounded-lg" />
              <div className="skeleton h-5 w-1/2 rounded-lg" />
              <div className="flex gap-2">
                <div className="skeleton h-7 w-20 rounded-lg" />
                <div className="skeleton h-7 w-24 rounded-lg" />
                <div className="skeleton h-7 w-16 rounded-lg" />
              </div>
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Plot skeleton */}
            <div className="card-glass rounded-2xl p-6 space-y-3">
              <div className="skeleton h-6 w-32 rounded-lg" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>

            {/* AI Insights skeleton */}
            <div className="gradient-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="space-y-1">
                  <div className="skeleton h-5 w-36 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>

              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-4 w-4/5 rounded" />
                </div>
                <div className="skeleton h-28 w-28 rounded-xl" />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="skeleton h-10 w-28 rounded-full" />
                <div className="skeleton h-4 flex-1 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
