import { IMDB_ID_REGEX } from '../src/middleware/validate';

describe('IMDb ID Validation', () => {
  test('should accept valid 7-digit IMDb ID', () => {
    expect(IMDB_ID_REGEX.test('tt0133093')).toBe(true);
  });

  test('should accept valid 8-digit IMDb ID', () => {
    expect(IMDB_ID_REGEX.test('tt10872600')).toBe(true);
  });

  test('should reject ID without tt prefix', () => {
    expect(IMDB_ID_REGEX.test('0133093')).toBe(false);
  });

  test('should reject ID with wrong prefix', () => {
    expect(IMDB_ID_REGEX.test('nm0133093')).toBe(false);
  });

  test('should reject ID with too few digits', () => {
    expect(IMDB_ID_REGEX.test('tt01330')).toBe(false);
  });

  test('should reject ID with too many digits', () => {
    expect(IMDB_ID_REGEX.test('tt012345678')).toBe(false);
  });

  test('should reject empty string', () => {
    expect(IMDB_ID_REGEX.test('')).toBe(false);
  });

  test('should reject ID with letters after tt', () => {
    expect(IMDB_ID_REGEX.test('ttabcdefg')).toBe(false);
  });

  test('should reject ID with special characters', () => {
    expect(IMDB_ID_REGEX.test('tt01330-3')).toBe(false);
  });
});
