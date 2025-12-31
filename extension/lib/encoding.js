/**
 * Text encoding utilities for proper UTF-8 to Base64 conversion
 * Required to handle Chinese characters correctly in GitHub API
 */

const EncodingUtils = {
  /**
   * Converts a UTF-8 string to Base64 encoding
   * Handles Chinese and other multi-byte characters correctly
   *
   * @param {string} str - The string to encode
   * @returns {string} Base64 encoded string
   *
   * @example
   * EncodingUtils.toBase64('你好世界') // returns '5L2g5aW95LiW55WM'
   */
  toBase64(str) {
    // Step 1: encodeURIComponent converts UTF-8 to URL-encoded format
    // Step 2: unescape converts URL-encoded to Latin1 string
    // Step 3: btoa converts to Base64
    return btoa(unescape(encodeURIComponent(str)));
  },

  /**
   * Converts Base64 encoded string back to UTF-8 text
   *
   * @param {string} base64 - Base64 encoded string
   * @returns {string} Decoded UTF-8 string
   *
   * @example
   * EncodingUtils.fromBase64('5L2g5aW95LiW55WM') // returns '你好世界'
   */
  fromBase64(base64) {
    // Reverse the toBase64 process
    return decodeURIComponent(escape(atob(base64)));
  },

  /**
   * Validates if a string is valid Base64
   *
   * @param {string} str - String to validate
   * @returns {boolean} True if valid Base64
   */
  isValidBase64(str) {
    try {
      return btoa(atob(str)) === str;
    } catch (e) {
      return false;
    }
  }
};
