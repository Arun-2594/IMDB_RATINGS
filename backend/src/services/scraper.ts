import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape top audience reviews from IMDb review page
 * Uses a browser-like User-Agent header to avoid blocking
 */
export async function scrapeImdbReviews(imdbId: string): Promise<string[]> {
  const url = `https://www.imdb.com/title/${imdbId}/reviews`;

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    const reviews: string[] = [];

    // IMDb review page selectors — try multiple patterns for robustness
    const selectors = [
      '.text.show-more__control',
      '.review-container .content .text',
      '[data-testid="review-overflow"] .ipc-html-content-inner-div',
      '.ipc-html-content-inner-div',
      '.lister-item-content .content .text',
    ];

    for (const selector of selectors) {
      $(selector).each((_index, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 30 && reviews.length < 15) {
          // Avoid duplicates
          if (!reviews.some((r) => r === text)) {
            reviews.push(text);
          }
        }
      });

      if (reviews.length >= 10) break;
    }

    // Fallback: try extracting from JSON-LD or script tags
    if (reviews.length === 0) {
      $('script[type="application/ld+json"]').each((_index, element) => {
        try {
          const jsonData = JSON.parse($(element).html() || '');
          if (jsonData.review && Array.isArray(jsonData.review)) {
            jsonData.review.forEach((r: { reviewBody?: string }) => {
              if (r.reviewBody && reviews.length < 15) {
                reviews.push(r.reviewBody.trim());
              }
            });
          }
        } catch {
          // Ignore JSON parse errors
        }
      });
    }

    if (reviews.length === 0) {
      console.warn(`No reviews found for ${imdbId}. IMDb page structure may have changed.`);
    }

    return reviews.slice(0, 15);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Movie with ID ${imdbId} not found on IMDb`);
      }
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Emergency Fallback: Scrape basic title/metadata directly from IMDb HTML
 */
export async function getBasicInfoDirectlyFromImdb(imdbId: string) {
  const url = `https://www.imdb.com/title/${imdbId}/`;
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      }
    });

    const $ = cheerio.load(response.data);
    const title = $('[data-testid="hero__primary-text"]').text().trim() ||
      $('h1').first().text().trim() ||
      'Unknown Title';

    const year = $('[href*="releaseinfo"]').first().text().trim().match(/\d{4}/)?.[0] || 'N/A';

    return { title, year, imdbId };
  } catch (err) {
    return null;
  }
}
