"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

interface SentimentInsightsProps {
  data: SentimentData;
}

const sentimentConfig = {
  POSITIVE: {
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.3)",
    label: "Positive",
    emoji: "😊",
    barColor: "from-emerald-500 to-emerald-300",
  },
  MIXED: {
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.3)",
    label: "Mixed",
    emoji: "🤔",
    barColor: "from-amber-500 to-amber-300",
  },
  NEGATIVE: {
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.3)",
    label: "Negative",
    emoji: "😞",
    barColor: "from-red-500 to-red-300",
  },
};

const CHART_COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export function SentimentInsights({ data }: SentimentInsightsProps) {
  const config = sentimentConfig[data.sentiment];

  const chartData = data.breakdown
    ? [
      { name: "Positive", value: data.breakdown.positive },
      { name: "Mixed", value: data.breakdown.mixed },
      { name: "Negative", value: data.breakdown.negative },
    ]
    : [
      { name: "Score", value: data.score },
      { name: "Remaining", value: 100 - data.score },
    ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="gradient-border p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))",
            }}
          >
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              AI Intelligence Report
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Powered by Claude AI
            </p>
          </div>
        </div>

        {/* AI Badge */}
        <div className="ai-badge px-3 py-1 rounded-full hidden sm:flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[var(--accent-purple)] font-semibold">
            Claude AI ✦
          </span>
        </div>
      </div>

      {/* One-Line Verdict */}
      {data.oneLineVerdict && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[var(--accent-purple)]/5 to-[var(--accent-cyan)]/5 border border-[var(--border)]"
        >
          <p className="text-white font-semibold text-[15px] italic leading-relaxed">
            &ldquo;{data.oneLineVerdict}&rdquo;
          </p>
        </motion.div>
      )}

      {/* Sentiment Score + Badge Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm"
          style={{
            background: config.bg,
            border: `1px solid ${config.border}`,
            color: config.color,
          }}
          id="sentiment-badge"
          data-sentiment={data.sentiment}
        >
          <span className="text-lg">{config.emoji}</span>
          <span>{config.label}</span>
        </motion.div>

        {/* Score */}
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                Audience Sentiment
              </span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-lg font-bold font-mono"
                style={{ color: config.color }}
              >
                {data.score}
                <span className="text-sm text-[var(--text-secondary)]">
                  /100
                </span>
              </motion.span>
            </div>
            <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.score}%` }}
                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${config.barColor}`}
                style={{
                  boxShadow: `0 0 12px ${config.border}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-white/80 leading-relaxed mb-6 text-[15px]"
      >
        {data.summary}
      </motion.p>

      {/* Two Column Layout: Themes + Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Key Themes */}
        <div>
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-3 font-mono">
            Key Themes Detected
          </h3>
          <div className="space-y-2">
            {data.themes.map((theme, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className="text-[var(--accent-purple)] text-xs">◆</span>
                <span className="text-white/70 text-sm">{theme}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sentiment Donut Chart */}
        {data.breakdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-3 font-mono">
              Sentiment Breakdown
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(13, 13, 26, 0.95)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#F8FAFC",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span className="text-white/70">
                    Positive {data.breakdown.positive}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-sm bg-amber-500" />
                  <span className="text-white/70">
                    Mixed {data.breakdown.mixed}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-sm bg-red-500" />
                  <span className="text-white/70">
                    Negative {data.breakdown.negative}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Positive Highlights & Negative Points */}
      {(data.positiveHighlights?.length || data.negativePoints?.length) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pt-4 border-t border-[var(--border)]">
          {data.positiveHighlights && data.positiveHighlights.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
                ↑ Audiences Loved
              </h4>
              <ul className="space-y-1.5">
                {data.positiveHighlights.map((h, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="text-sm text-white/60 flex items-start gap-2"
                  >
                    <span className="text-emerald-400 mt-0.5">+</span>
                    {h}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          {data.negativePoints && data.negativePoints.length > 0 && (
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 mb-2">
                ↓ Common Criticisms
              </h4>
              <ul className="space-y-1.5">
                {data.negativePoints.map((n, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                    className="text-sm text-white/60 flex items-start gap-2"
                  >
                    <span className="text-red-400 mt-0.5">−</span>
                    {n}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Audience Profile & Rewatch */}
      {(data.audienceProfile || data.rewatch) && (
        <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border)]">
          {data.audienceProfile && (
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-mono mb-1">
                Audience Profile
              </p>
              <p className="text-sm text-white/70">{data.audienceProfile}</p>
            </div>
          )}
          {data.rewatch && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-mono mb-1">
                Rewatch Value
              </p>
              <span
                className={`text-sm font-semibold px-2.5 py-0.5 rounded-md ${data.rewatch === "high"
                    ? "text-emerald-400 bg-emerald-400/10"
                    : data.rewatch === "medium"
                      ? "text-amber-400 bg-amber-400/10"
                      : "text-red-400 bg-red-400/10"
                  }`}
              >
                {data.rewatch.charAt(0).toUpperCase() + data.rewatch.slice(1)}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
