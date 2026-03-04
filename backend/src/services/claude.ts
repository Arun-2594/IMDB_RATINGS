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

  // FALLBACK: Simulation Mode (If no API Key or placeholder is present)
  if (!apiKey || apiKey === 'PASTE_YOUR_CLAUDE_KEY_HERE') {
    console.log(`🤖 Simulation Mode: Generating AI Insights for "${movieTitle}"...`);

    // Artificial delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      summary: `Audience reception for "${movieTitle}" is remarkably strong across the board. Viewers consistently praise the film's visual ambition and stylistic direction, noting that it creates a unique atmospheric experience that sets it apart from contemporary peers. The emotional core of the story is cited as a major strength, providing a grounded reality to the film's grander concepts.`,
      themes: [
        'Cinematic Atmosphere',
        'Narrative Ambition',
        'Stellar Visual Design',
        'Emotional Depth',
        'Genre-Defining Techniques'
      ],
      positiveHighlights: [
        'Exceptional visual direction and color palettes',
        'Highly nuanced and memorable performances',
        'Innovative world-building and attention to detail'
      ],
      negativePoints: [
        'Pacing slows slightly in the middle chapter',
        'Some plot developments require close attention to fully grasp'
      ],
      sentiment: 'POSITIVE',
      score: 89,
      breakdown: {
        positive: 82,
        mixed: 12,
        negative: 6
      },
      audienceProfile: 'Lovers of high-concept cinema, visual storytelling enthusiasts, and character-driven drama fans.',
      rewatch: 'high',
      oneLineVerdict: 'A masterfully executed achievement in modern filmmaking that rewards deep engagement.'
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
