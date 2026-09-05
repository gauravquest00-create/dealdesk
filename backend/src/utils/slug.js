/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to slug
 * @param {object} options - Optional configuration
 * @param {boolean} options.lowercase - Convert to lowercase (default: true)
 * @param {string} options.separator - Separator character (default: '-')
 * @param {boolean} options.trim - Trim whitespace (default: true)
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (text, options = {}) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const {
    lowercase = true,
    separator = '-',
    trim = true,
  } = options;

  let slug = text;

  // Trim whitespace
  if (trim) {
    slug = slug.trim();
  }

  // Convert to lowercase
  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Replace special characters
  slug = slug
    // Replace spaces with separator
    .replace(/\s+/g, separator)
    // Remove special characters (keep only letters, numbers, and separator)
    .replace(/[^a-z0-9\-]/g, '')
    // Remove multiple consecutive separators
    .replace(/-{2,}/g, separator)
    // Remove leading/trailing separators
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

  // If slug is empty after processing, generate a fallback
  if (!slug) {
    slug = `item-${Date.now()}`;
  }

  return slug;
};

/**
 * Generate a unique slug by appending a counter if slug already exists
 * @param {string} baseText - The base text to generate slug from
 * @param {Function} checkExists - Async function to check if slug exists (returns boolean)
 * @param {object} options - Same options as generateSlug
 * @returns {Promise<string>} - Unique slug
 */
export const generateUniqueSlug = async (baseText, checkExists, options = {}) => {
  let slug = generateSlug(baseText, options);
  let counter = 1;
  let finalSlug = slug;

  // If slug is empty, use a fallback
  if (!slug) {
    slug = 'item';
    finalSlug = slug;
  }

  // Check if slug exists and append counter if needed
  while (await checkExists(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
};

export default generateSlug;