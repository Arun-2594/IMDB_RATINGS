import { GoogleGenerativeAI } from "@google/generative-ai";
import { SentimentResult } from "../types/sentiment.types";

/**
 * Analyze movie reviews using Google Gemini AI (Free Tier)
 */
export async function analyzeSentiment(
    reviews: string[],
    movieTitle: string,
    year?: string
): Promise<SentimentResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    // FALLBACK: Dynamic Simulation Mode (If no API Key is present)
    if (!apiKey || apiKey === 'PASTE_YOUR_GEMINI_KEY_HERE') {
        console.log(`🤖 Simulation Mode: Generating insights for "${movieTitle}"...`);
        const seed = movieTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const score = 70 + (seed % 25);
        return {
            summary: `Audience reception for "${movieTitle}" is generally positive, with viewers highlighting its unique atmosphere and strong lead performances.`,
            themes: ['Cinematic Style', 'Character Depth', 'Visual Storytelling'],
            positiveHighlights: ['Engaging plot', 'Great acting'],
            negativePoints: ['Slightly slow pacing'],
            sentiment: score > 80 ? 'POSITIVE' : 'MIXED',
            score: score,
            breakdown: { positive: score, mixed: 15, negative: Math.max(0, 85 - score) },
            audienceProfile: 'Film enthusiasts',
            rewatch: 'medium',
            oneLineVerdict: 'A solid cinematic experience.'
        };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const reviewsText = reviews.slice(0, 15).join("\n\n");
    const prompt = `Analyze these audience reviews for "${movieTitle}"${year ? ` (${year})` : ''}:
  ${reviewsText}

  Return ONLY a valid JSON object:
  {
    "summary": "3-4 sentence narrative of audience reception",
    "themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
    "positiveHighlights": ["loved most", "another"],
    "negativePoints": ["criticisms", "another"],
    "sentiment": "POSITIVE" | "MIXED" | "NEGATIVE",
    "score": 0-100,
    "breakdown": { "positive": %, "mixed": %, "negative": % },
    "audienceProfile": "who is this for?",
    "rewatch": "high" | "medium" | "low",
    "oneLineVerdict": "snappy one-liner"
  }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean potential markdown
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr) as SentimentResult;
}
