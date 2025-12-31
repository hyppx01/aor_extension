/**
 * GitHub API client for creating/updating repository files
 * Uses GitHub REST API v3
 */

/**
 * GitHub API error class
 */
class GitHubApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.response = response;
  }
}

/**
 * GitHub API configuration
 */
class GitHubConfig {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = 'https://api.github.com';
  }

  /**
   * Validates the configuration
   * @throws {Error} If configuration is invalid
   */
  validate() {
    if (!this.token) {
      throw new Error('GitHub token is required');
    }
    if (!this.owner) {
      throw new Error('GitHub owner/username is required');
    }
    if (!this.repo) {
      throw new Error('GitHub repository name is required');
    }
  }

  /**
   * Gets the authorization header
   * @returns {string} Authorization header value
   */
  getAuthHeader() {
    return `token ${this.token}`;
  }
}

/**
 * GitHub API client class
 */
class GitHubApiClient {
  /**
   * Creates a new GitHub API client
   *
   * @param {string} token - GitHub Personal Access Token
   * @param {string} owner - Repository owner (username or org)
   * @param {string} repo - Repository name
   */
  constructor(token, owner, repo) {
    this.config = new GitHubConfig(token, owner, repo);
    this.config.validate();
  }

  /**
   * Tests the connection to GitHub API
   *
   * @returns {Promise<Object>} User information if successful
   * @throws {GitHubApiError} If authentication fails
   */
  async testConnection() {
    const response = await fetch(`${this.config.baseUrl}/user`, {
      method: 'GET',
      headers: {
        'Authorization': this.config.getAuthHeader(),
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new GitHubApiError(
        'Authentication failed. Please check your token.',
        response.status,
        await response.json()
      );
    }

    return await response.json();
  }

  /**
   * Creates a new file in the repository
   *
   * @param {string} path - File path (e.g., 'posts/my-post.md')
   * @param {string} content - File content (will be Base64 encoded)
   * @param {string} message - Commit message
   * @returns {Promise<Object>} API response
   * @throws {GitHubApiError} If creation fails
   */
  async createFile(path, content, message) {
    const url = `${this.config.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;

    const body = {
      message: message,
      content: content
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': this.config.getAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(body)
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new GitHubApiError(
        responseData.message || 'Failed to create file',
        response.status,
        responseData
      );
    }

    return responseData;
  }

  /**
   * Checks if a file exists in the repository
   *
   * @param {string} path - File path to check
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(path) {
    try {
      const url = `${this.config.baseUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${path}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.config.getAuthHeader(),
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Creates a markdown blog post with frontmatter
   *
   * @param {string} title - Post title
   * @param {string} content - Post content (markdown)
   * @param {Object} options - Additional options
   * @param {string} options.path - Target path (default: 'posts')
   * @param {string} options.filename - Custom filename (optional)
   * @param {boolean} options.datePrefix - Add date prefix to filename
   * @returns {Promise<Object>} API response
   */
  async createPost(title, content, options = {}) {
    const {
      path = 'posts',
      filename = null,
      datePrefix = true
    } = options;

    // Generate frontmatter
    const dateStr = new Date().toISOString().split('T')[0];
    const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${dateStr}"
---

`;

    const fullContent = frontmatter + content;

    // Use EncodingUtils for encoding
    const contentBase64 = EncodingUtils.toBase64(fullContent);

    // Generate filename if not provided
    let finalFilename = filename;
    if (!finalFilename) {
      finalFilename = SlugUtils.generateFilename(title, { datePrefix });
    }

    // Create full file path
    const fullPath = path ? `${path}/${finalFilename}` : finalFilename;

    // Create the file
    const commitMessage = `Add post: ${title}`;
    return await this.createFile(fullPath, contentBase64, commitMessage);
  }
}

/**
 * Factory function to create a GitHub API client
 *
 * @param {Object} config - Configuration object
 * @param {string} config.token - GitHub token
 * @param {string} config.owner - Repository owner
 * @param {string} config.repo - Repository name
 * @returns {GitHubApiClient} Configured API client
 */
function createGitHubClient(config) {
  return new GitHubApiClient(config.token, config.owner, config.repo);
}
