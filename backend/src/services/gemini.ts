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
  const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

  let lastError: any = null;

  for (const modelName of modelNames) {
    try {
      console.log(`🤖 Attempting AI analysis with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const reviewsText = reviews.slice(0, 15).join("\n\n");
      const prompt = `Analyze these audience reviews for "${movieTitle}"${year ? ` (${year})` : ''}:
      ${reviewsText}

      Return ONLY a valid JSON object. Do not include any text before or after the JSON.
      {
        "summary": "3-4 sentence narrative of audience reception",
        "themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
        "positiveHighlights": ["highlight1", "highlight2"],
        "negativePoints": ["point1", "point2"],
        "sentiment": "POSITIVE",
        "score": 85,
        "breakdown": { "positive": 80, "mixed": 15, "negative": 5 },
        "audienceProfile": "description",
        "rewatch": "high",
        "oneLineVerdict": "verdict"
      }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');

      if (startIdx === -1 || endIdx === -1) {
        throw new Error("Invalid AI response format");
      }

      const jsonStr = text.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonStr) as SentimentResult;
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} failed:`, err);
      lastError = err;
      continue; // Try next model
    }
  }

  throw new Error(`AI Analysis failed after trying all models. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
}
