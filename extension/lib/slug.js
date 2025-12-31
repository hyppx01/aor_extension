/**
 * Filename and slug generation utilities
 * Converts titles into URL-safe filenames
 * GitHub supports Chinese characters in filenames, so we preserve them
 */

const SlugUtils = {
  /**
   * Generates a URL-friendly slug from a title
   * Preserves Chinese characters as GitHub supports them
   *
   * @param {string} title - The title to convert
   * @param {Object} options - Configuration options
   * @param {boolean} options.datePrefix - Add date prefix (default: false)
   * @param {string} options.separator - Separator character (default: '-')
   * @param {number} options.maxLength - Maximum length (default: 200)
   * @returns {string} URL-friendly slug
   *
   * @example
   * SlugUtils.generateSlug('Hello World 你好')
   * // returns 'hello-world-你好'
   *
   * SlugUtils.generateSlug('Test', { datePrefix: true })
   * // returns '2024-12-30-test'
   */
  generateSlug(title, options = {}) {
    const {
      datePrefix = false,
      separator = '-',
      maxLength = 200
    } = options;

    // Step 1: Convert to lowercase (for English/numbers only)
    // Chinese characters don't have lowercase, so they're preserved
    let slug = title.toLowerCase();

    // Step 2: Replace spaces and special chars with separator
    // Keep alphanumeric, Chinese characters (\u4e00-\u9fa5), and hyphens
    slug = slug
      .replace(/[^\w\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]+/g, separator)
      .replace(new RegExp(`${separator}+`, 'g'), separator);

    // Step 3: Trim separators from start and end
    slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');

    // Step 4: Add date prefix if requested
    if (datePrefix) {
      const dateStr = new Date().toISOString().split('T')[0];
      slug = `${dateStr}${separator}${slug}`;
    }

    // Step 5: Truncate to max length
    if (slug.length > maxLength) {
      slug = slug.substring(0, maxLength).replace(new RegExp(`${separator}+$`), '');
    }

    // Step 6: Fallback for empty slugs
    if (!slug) {
      slug = `untitled-${Date.now()}`;
    }

    return slug;
  },

  /**
   * Generates a complete markdown filename
   *
   * @param {string} title - Article title
   * @param {Object} options - Slug generation options
   * @returns {string} Complete filename with .md extension
   *
   * @example
   * SlugUtils.generateFilename('My First Post 你好') // returns 'my-first-post-你好.md'
   */
  generateFilename(title, options = {}) {
    const slug = this.generateSlug(title, options);
    return `${slug}.md`;
  }
};
