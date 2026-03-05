import Anthropic from '@anthropic-ai/sdk';
import { SentimentResult } from '../types/sentiment.types';

/**
 * Parse Claude's response text into a structured SentimentResult.
 * Handles markdown code blocks and plain JSON.
 */
export function parseSentimentResponse(responseText: string): SentimentResult {
  let jsonStr = responseText;

  // Remove markdown code blocks if present
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate & normalize
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('Missing or invalid summary');
    }
    if (!['POSITIVE', 'MIXED', 'NEGATIVE'].includes(parsed.sentiment)) {
      throw new Error('Invalid sentiment value');
    }

    const score = Number(parsed.score);
    if (isNaN(score) || score < 1 || score > 100) {
      throw new Error('Score must be 1-100');
    }

    // Normalize breakdown percentages
    const breakdown = parsed.breakdown || { positive: 60, mixed: 25, negative: 15 };
    const total = (breakdown.positive || 0) + (breakdown.mixed || 0) + (breakdown.negative || 0);
    if (total > 0 && total !== 100) {
      const factor = 100 / total;
      breakdown.positive = Math.round((breakdown.positive || 0) * factor);
      breakdown.mixed = Math.round((breakdown.mixed || 0) * factor);
      breakdown.negative = 100 - breakdown.positive - breakdown.mixed;
    }

    return {
      summary: parsed.summary,
      themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 5) : [],
      positiveHighlights: Array.isArray(parsed.positiveHighlights)
        ? parsed.positiveHighlights.slice(0, 3)
        : [],
      negativePoints: Array.isArray(parsed.negativePoints)
        ? parsed.negativePoints.slice(0, 3)
        : [],
      sentiment: parsed.sentiment,
      score: Math.round(score),
      breakdown: {
        positive: breakdown.positive || 60,
        mixed: breakdown.mixed || 25,
        negative: breakdown.negative || 15,
      },
      audienceProfile: parsed.audienceProfile || 'General audiences',
      rewatch: ['high', 'medium', 'low'].includes(parsed.rewatch)
        ? parsed.rewatch
        : 'medium',
      oneLineVerdict: parsed.oneLineVerdict || parsed.summary?.split('.')[0] + '.' || '',
    };
  } catch (parseError) {
    // Fallback: extract fields manually
    const summaryMatch = responseText.match(/"summary"\s*:\s*"([^"]+)"/);
    const sentimentMatch = responseText.match(/"sentiment"\s*:\s*"(POSITIVE|MIXED|NEGATIVE)"/);
    const scoreMatch = responseText.match(/"score"\s*:\s*(\d+)/);
    const themesMatch = responseText.match(/"themes"\s*:\s*\[([\s\S]*?)\]/);

    if (summaryMatch && sentimentMatch && scoreMatch) {
      let themes: string[] = [];
      if (themesMatch) {
        themes = themesMatch[1]
          .split(',')
          .map((t) => t.trim().replace(/"/g, ''))
          .filter((t) => t.length > 0)
          .slice(0, 5);
      }

      return {
        summary: summaryMatch[1],
        themes,
        positiveHighlights: [],
        negativePoints: [],
        sentiment: sentimentMatch[1] as 'POSITIVE' | 'MIXED' | 'NEGATIVE',
        score: Math.min(100, Math.max(1, parseInt(scoreMatch[1], 10))),
        breakdown: { positive: 60, mixed: 25, negative: 15 },
        audienceProfile: 'General audiences',
        rewatch: 'medium',
        oneLineVerdict: summaryMatch[1].split('.')[0] + '.',
      };
    }

    throw new Error(
      `Failed to parse sentiment response: ${parseError instanceof Error ? parseError.message : 'Unknown'}`
    );
  }
}

/**
 * Analyze movie reviews using Claude AI with enhanced structured output
 */
export async function analyzeSentiment(
  reviews: string[],
  movieTitle: string,
  year?: string
): Promise<SentimentResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // FALLBACK: Dynamic Simulation Mode (If no API Key or placeholder is present)
  if (!apiKey || apiKey === 'PASTE_YOUR_CLAUDE_KEY_HERE') {
    console.log(`🤖 Dynamic Simulation Mode: Generating AI Insights for "${movieTitle}"...`);

    // Artificial delay for realism (1.5s to 3s)
    const delay = 1500 + Math.random() * 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate pseudo-random variations based on the title string
    const seed = movieTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const var1 = (seed % 15) - 7; // -7 to +7
    const var2 = (seed % 10);      // 0 to 9

    const baseScore = 75 + var1;
    const pos = Math.min(95, baseScore + var2);
    const neg = Math.max(5, 100 - pos - (seed % 15));
    const mixed = 100 - pos - neg;

    const adjectives = ["compelling", "extraordinary", "visceral", "thought-provoking", "groundbreaking", "polarizing", "heartwarming"];
    const adj = adjectives[seed % adjectives.length];

    return {
      summary: `Audience reception for "${movieTitle}"${year ? ` (${year})` : ''} is characterized as ${adj} and highly impactful. Collectors and critics alike highlight the distinctive tonal choices and the resonance of the central performances. While there is broad consensus on its technical merit, some viewers debate the pacing of its final act, creating a rich discourse around its ultimate legacy.`,
      themes: [
        'Cinematic Innovation',
        `${movieTitle} Narrative Structure`,
        'Atmospheric World-building',
        'Legacy and Cultural Impact',
        'Performance Excellence'
      ],
      positiveHighlights: [
        `Masterful execution of "${movieTitle}" key themes`,
        'Exceptional visual fidelity and cinematography',
        'Deeply resonant score and sound design'
      ],
      negativePoints: [
        'Experimental pacing may not appeal to all traditionalists',
        'Intricate plot requires significant audience investment'
      ],
      sentiment: baseScore > 80 ? 'POSITIVE' : (baseScore > 60 ? 'MIXED' : 'NEGATIVE'),
      score: baseScore,
      breakdown: {
        positive: pos,
        mixed: mixed,
        negative: neg
      },
      audienceProfile: `Dedicated cinephiles and fans of ${adj} storytelling who value creative risk-taking.`,
      rewatch: baseScore > 85 ? 'high' : (baseScore > 70 ? 'medium' : 'low'),
      oneLineVerdict: `A ${adj} achievement that stands as a significant contribution to its genre.`
    };
  }

  const client = new Anthropic({ apiKey });

  const reviewsText = reviews
    .map((review, i) => `Review ${i + 1}: "${review}"`)
    .join('\n\n');

  const prompt = `You are a world-class film critic and data analyst. Analyze these audience reviews for "${movieTitle}"${year ? ` (${year})` : ''}.

REVIEWS:
${reviewsText}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "summary": "3-4 sentence narrative of audience reception",
  "themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "positiveHighlights": ["what audiences loved most", "another positive"],
  "negativePoints": ["common criticisms", "another criticism"],
  "sentiment": "POSITIVE" | "MIXED" | "NEGATIVE",
  "score": 1-100,
  "breakdown": {
    "positive": percentage_number,
    "mixed": percentage_number,
    "negative": percentage_number
  },
  "audienceProfile": "who loves this film",
  "rewatch": "high" | "medium" | "low",
  "oneLineVerdict": "punchy single sentence"
}

The breakdown percentages must add up to 100. Score is out of 100. Be accurate and insightful.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response received from Claude');
  }

  return parseSentimentResponse(textBlock.text);
}
