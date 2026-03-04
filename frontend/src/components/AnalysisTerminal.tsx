"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AnalysisStep {
    step: string;
    status: "waiting" | "loading" | "done" | "error";
    progress: number;
    message?: string;
}

interface AnalysisTerminalProps {
    imdbId: string;
    steps: AnalysisStep[];
    overallProgress: number;
}

const stepLabels: Record<string, string> = {
    metadata: "Fetching movie metadata",
    poster: "Loading poster and cast",
    reviews: "Scraping audience reviews",
    ai: "Running Claude AI analysis",
    report: "Building sentiment report",
};

const stepIcons: Record<string, string> = {
    waiting: "○",
    loading: "⟳",
    done: "✓",
    error: "✗",
};

export function AnalysisTerminal({
    imdbId,
    steps,
    overallProgress,
}: AnalysisTerminalProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="terminal-container max-w-2xl w-full mx-auto"
        >
            {/* Terminal Header */}
            <div className="terminal-header">
                <div className="terminal-dot" style={{ background: "#EF4444" }} />
                <div className="terminal-dot" style={{ background: "#F59E0B" }} />
                <div className="terminal-dot" style={{ background: "#10B981" }} />
                <span className="text-xs text-[var(--text-secondary)] ml-2 font-mono">
                    cinescope-ai — analyzing
                </span>
                <span className="text-xs text-[var(--accent-purple)] font-mono ml-auto">
                    {imdbId}
                </span>
            </div>

            {/* Terminal Body */}
            <div className="terminal-body">
                {/* Header line */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
                    <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2.5 h-2.5 rounded-full bg-[var(--accent-purple)]"
                    />
                    <span className="text-sm font-mono text-[var(--text-primary)] font-semibold">
                        ANALYZING {imdbId}
                    </span>
                </div>

                {/* Steps */}
                <div className="space-y-1">
                    <AnimatePresence>
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.step}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="terminal-line"
                            >
                                {/* Status Icon */}
                                <span
                                    className={`font-mono text-base w-5 flex-shrink-0 ${step.status === "done"
                                            ? "text-green-400"
                                            : step.status === "loading"
                                                ? "text-[var(--accent-purple)]"
                                                : step.status === "error"
                                                    ? "text-red-400"
                                                    : "text-[var(--text-secondary)]/40"
                                        }`}
                                >
                                    {step.status === "loading" ? (
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                            className="inline-block"
                                        >
                                            {stepIcons[step.status]}
                                        </motion.span>
                                    ) : (
                                        stepIcons[step.status]
                                    )}
                                </span>

                                {/* Step Label */}
                                <span
                                    className={`flex-1 text-sm font-mono ${step.status === "done"
                                            ? "text-[var(--text-primary)]"
                                            : step.status === "loading"
                                                ? "text-[var(--text-primary)]"
                                                : "text-[var(--text-secondary)]/50"
                                        }`}
                                >
                                    {step.message || stepLabels[step.step] || step.step}
                                </span>

                                {/* Status Badge */}
                                <span
                                    className={`text-xs font-mono px-2 py-0.5 rounded ${step.status === "done"
                                            ? "text-green-400 bg-green-400/10"
                                            : step.status === "loading"
                                                ? "text-[var(--accent-purple)] bg-[var(--accent-purple)]/10"
                                                : step.status === "error"
                                                    ? "text-red-400 bg-red-400/10"
                                                    : "text-[var(--text-secondary)]/30"
                                        }`}
                                >
                                    {step.status === "done"
                                        ? "DONE"
                                        : step.status === "loading"
                                            ? `${step.progress}%`
                                            : step.status === "error"
                                                ? "FAIL"
                                                : "WAIT"}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Overall Progress Bar */}
                <div className="mt-6 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-[var(--text-secondary)]">
                            Progress
                        </span>
                        <span className="text-xs font-mono text-[var(--accent-purple)] font-semibold">
                            {overallProgress}%
                        </span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden progress-bar-animated">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background:
                                    "linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))",
                            }}
                            initial={{ width: "0%" }}
                            animate={{ width: `${overallProgress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
