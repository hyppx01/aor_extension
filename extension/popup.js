/**
 * AI Output Clipper - Main Application Logic
 * Handles user interactions and coordinates with GitHub API
 */

// State management
const state = {
  config: null,
  isPublishing: false,
  extractedTitle: null // Stores title extracted from content
};

// DOM element references (cached for performance)
const elements = {};

/**
 * Initialize the application
 */
async function init() {
  cacheElements();
  loadConfig();
  setupEventListeners();
  updateConnectionStatus();
  startCharCounter();
  updateTitleSummary(null); // Initialize with default text
}

/**
 * Cache DOM element references
 */
function cacheElements() {
  elements.title = document.getElementById('title');
  elements.content = document.getElementById('content');
  elements.titleDetails = document.getElementById('title-details');
  elements.titleSummaryText = document.getElementById('title-summary-text');
  elements.publishBtn = document.getElementById('publish-btn');
  elements.previewBtn = document.getElementById('preview-btn');
  elements.saveConfigBtn = document.getElementById('save-config-btn');
  elements.testConnectionBtn = document.getElementById('test-connection-btn');
  elements.statusMessage = document.getElementById('status-message');
  elements.connectionStatus = document.getElementById('connection-status');
  elements.charCount = document.getElementById('char-count');

  // Config fields
  elements.ghToken = document.getElementById('gh-token');
  elements.ghRepoUrl = document.getElementById('gh-repo-url');
  elements.ghDatePrefix = document.getElementById('gh-date-prefix');
}

/**
 * Parse GitHub repository URL to extract owner and repo
 * @param {string} url - GitHub repository URL
 * @returns {Object|null} Object with owner and repo, or null if invalid
 */
function parseGitHubUrl(url) {
  if (!url) return null;

  // Match patterns like:
  // https://github.com/owner/repo
  // github.com/owner/repo
  // owner/repo
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/\?#]+)/,
    /^github\.com\/([^\/]+)\/([^\/\?#]+)/,
    /^([^\/]+)\/([^\/\?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }

  return null;
}

/**
 * Extract title from Markdown content
 * Priority: h1 > h2 > null
 * @param {string} content - Markdown content
 * @returns {string|null} Extracted title or null
 */
function extractTitleFromMarkdown(content) {
  if (!content) return null;

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Match # Heading (h1)
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Match ## Heading (h2)
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      return h2Match[1].trim();
    }
  }

  return null;
}

/**
 * Update title summary text
 * @param {string|null} title - Current title
 */
function updateTitleSummary(title) {
  if (title) {
    elements.titleSummaryText.textContent = `文章标题: ${title}`;
  } else {
    elements.titleSummaryText.textContent = '文章标题 (需要手动设置)';
  }
}

/**
 * Load configuration from Chrome storage
 */
async function loadConfig() {
  try {
    const stored = await chrome.storage.sync.get([
      'ghToken',
      'ghRepoUrl',
      'ghDatePrefix'
    ]);

    state.config = {
      ghToken: stored.ghToken || '',
      ghRepoUrl: stored.ghRepoUrl || '',
      ghPath: 'posts', // Fixed path
      ghDatePrefix: stored.ghDatePrefix !== false // default true
    };

    // Parse owner and repo from URL
    const parsed = parseGitHubUrl(state.config.ghRepoUrl);
    state.config.ghOwner = parsed?.owner || '';
    state.config.ghRepo = parsed?.repo || '';

    // Populate form fields
    if (state.config.ghToken) elements.ghToken.value = state.config.ghToken;
    if (state.config.ghRepoUrl) elements.ghRepoUrl.value = state.config.ghRepoUrl;
    elements.ghDatePrefix.checked = state.config.ghDatePrefix;
  } catch (error) {
    console.error('Failed to load config:', error);
    showStatus('配置加载失败', 'error');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  elements.saveConfigBtn.addEventListener('click', handleSaveConfig);
  elements.publishBtn.addEventListener('click', handlePublish);
  elements.previewBtn.addEventListener('click', handlePreview);
  elements.testConnectionBtn.addEventListener('click', handleTestConnection);

  // Auto-extract title from content
  elements.content.addEventListener('input', handleContentInput);

  // Update summary when title is manually edited
  elements.title.addEventListener('input', handleTitleInput);

  // Toggle details when user manually edits title
  elements.title.addEventListener('focus', () => {
    if (!elements.titleDetails.open) {
      elements.titleDetails.open = true;
    }
  });
}

/**
 * Handle content input - auto-extract title
 */
function handleContentInput() {
  const content = elements.content.value;
  const extractedTitle = extractTitleFromMarkdown(content);

  state.extractedTitle = extractedTitle;

  // Only update the title input if it's empty or matches the previous extracted title
  // This allows manual override
  if (extractedTitle) {
    // If the input is empty or starts with "(自动检测)", update it
    if (!elements.title.value || elements.title.value === state.extractedTitle) {
      elements.title.value = extractedTitle;
    }
    updateTitleSummary(extractedTitle);
    // Keep the details collapsed since we have a title
    if (elements.titleDetails.open && document.activeElement !== elements.title) {
      elements.titleDetails.open = false;
    }
  } else {
    updateTitleSummary(null);
    // Auto-expand if no title found
    if (!elements.title.value) {
      elements.titleDetails.open = true;
    }
  }
}

/**
 * Handle title input
 */
function handleTitleInput() {
  const manualTitle = elements.title.value.trim();
  updateTitleSummary(manualTitle || null);

  // Clear status if it contains title-related message
  if (elements.statusMessage.textContent.includes('标题')) {
    clearStatus();
  }
}

/**
 * Handle save configuration
 */
async function handleSaveConfig() {
  const ghRepoUrl = elements.ghRepoUrl.value.trim();
  const parsed = parseGitHubUrl(ghRepoUrl);

  const config = {
    ghToken: elements.ghToken.value.trim(),
    ghRepoUrl: ghRepoUrl,
    ghPath: 'posts', // Fixed path
    ghDatePrefix: elements.ghDatePrefix.checked
  };

  // Validation
  if (!config.ghToken) {
    showStatus('请填写 GitHub Token', 'error');
    return;
  }

  if (!parsed) {
    showStatus('请填写正确的仓库地址，例如: https://github.com/jclio-my/ai_output_retention', 'error');
    return;
  }

  // Store parsed values
  config.ghOwner = parsed.owner;
  config.ghRepo = parsed.repo;

  // Token format validation
  if (!config.ghToken.startsWith('ghp_') && !config.ghToken.startsWith('github_pat_')) {
    showStatus('警告: Token 格式可能不正确', 'warning');
  }

  try {
    await chrome.storage.sync.set(config);
    state.config = config;
    showStatus('配置已保存', 'success');
    updateConnectionStatus();
  } catch (error) {
    console.error('Failed to save config:', error);
    showStatus('配置保存失败', 'error');
  }
}

/**
 * Handle test connection
 */
async function handleTestConnection() {
  const btn = elements.testConnectionBtn;
  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = '测试中...';

  try {
    const ghRepoUrl = elements.ghRepoUrl.value.trim();
    const parsed = parseGitHubUrl(ghRepoUrl);

    if (!parsed) {
      showStatus('请填写正确的仓库地址', 'error');
      btn.disabled = false;
      btn.textContent = originalText;
      return;
    }

    const client = createGitHubClient({
      token: elements.ghToken.value.trim(),
      owner: parsed.owner,
      repo: parsed.repo
    });

    const userInfo = await client.testConnection();
    showStatus(`连接成功! 登录为: ${userInfo.login}`, 'success');
    updateConnectionStatus(true);
  } catch (error) {
    console.error('Connection test failed:', error);
    let message = '连接失败';
    if (error.status === 401) {
      message = 'Token 无效或已过期';
    } else if (error.status === 404) {
      message = '仓库不存在或无权访问';
    }
    showStatus(message, 'error');
    updateConnectionStatus(false);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

/**
 * Handle preview filename
 */
async function handlePreview() {
  // Use extracted title or manual input
  const title = elements.title.value.trim() || state.extractedTitle;

  if (!title) {
    showStatus('请先输入内容或手动设置标题', 'warning');
    // Expand title section to prompt user
    elements.titleDetails.open = true;
    elements.title.focus();
    return;
  }

  const filename = SlugUtils.generateFilename(title, {
    datePrefix: elements.ghDatePrefix.checked
  });

  // Path is always 'posts'
  const fullPath = `posts/${filename}`;

  showStatus(`预览: ${fullPath}`, 'info');
}

/**
 * Handle publish
 */
async function handlePublish() {
  if (state.isPublishing) return;

  // Validation - use extracted title or manual input
  const title = elements.title.value.trim() || state.extractedTitle;
  const content = elements.content.value;

  if (!state.config?.ghToken || !state.config?.ghOwner || !state.config?.ghRepo) {
    showStatus('请先配置 GitHub 信息', 'error');
    return;
  }

  if (!title) {
    showStatus('请输入文章标题', 'error');
    elements.titleDetails.open = true;
    elements.title.focus();
    return;
  }

  if (!content) {
    showStatus('请输入文章内容', 'error');
    elements.content.focus();
    return;
  }

  // Start publishing
  state.isPublishing = true;
  elements.publishBtn.disabled = true;
  elements.publishBtn.textContent = '发布中...';

  try {
    const client = createGitHubClient({
      token: state.config.ghToken,
      owner: state.config.ghOwner,
      repo: state.config.ghRepo
    });

    const result = await client.createPost(title, content, {
      path: state.config.ghPath,
      datePrefix: state.config.ghDatePrefix
    });

    // Success!
    const postUrl = result.content.html_url;
    showStatus(`发布成功! Cloudflare 正在构建...`, 'success');

    // Clear form
    elements.title.value = '';
    state.extractedTitle = null;
    updateTitleSummary(null);
    elements.content.value = '';
    updateCharCount();

    // Optionally open the post
    setTimeout(() => {
      showStatus(
        `发布成功! <a href="${postUrl}" target="_blank" style="color:inherit;text-decoration:underline;">查看文件</a>`,
        'success'
      );
    }, 2000);

  } catch (error) {
    console.error('Publish failed:', error);

    let message = '发布失败';
    if (error.status === 401) {
      message = 'Token 无效,请检查配置';
    } else if (error.status === 404) {
      message = '仓库不存在或无权访问';
    } else if (error.status === 409 || error.status === 422) {
      message = '文件已存在,请修改标题';
    } else if (error.response?.message) {
      message = `发布失败: ${error.response.message}`;
    } else {
      message = `网络错误: ${error.message}`;
    }

    showStatus(message, 'error');
  } finally {
    state.isPublishing = false;
    elements.publishBtn.disabled = false;
    elements.publishBtn.textContent = '发布到博客';
  }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
  elements.statusMessage.innerHTML = message;
  elements.statusMessage.className = `status-message status-${type}`;
  elements.statusMessage.style.display = 'block';

  // Auto-hide after 5 seconds for success, keep for errors
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      if (elements.statusMessage.textContent === message ||
          elements.statusMessage.innerHTML === message) {
        clearStatus();
      }
    }, 5000);
  }
}

/**
 * Clear status message
 */
function clearStatus() {
  elements.statusMessage.textContent = '';
  elements.statusMessage.className = 'status-message';
  elements.statusMessage.style.display = 'none';
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected = null) {
  if (connected === true) {
    elements.connectionStatus.textContent = '●';
    elements.connectionStatus.className = 'status-indicator connected';
    elements.connectionStatus.title = '已连接到 GitHub';
  } else if (connected === false) {
    elements.connectionStatus.textContent = '●';
    elements.connectionStatus.className = 'status-indicator disconnected';
    elements.connectionStatus.title = '连接失败';
  } else {
    elements.connectionStatus.textContent = '○';
    elements.connectionStatus.className = 'status-indicator';
    elements.connectionStatus.title = '连接状态未知';
  }
}

/**
 * Start character counter
 */
function startCharCounter() {
  updateCharCount();
  elements.content.addEventListener('input', updateCharCount);
}

/**
 * Update character count
 */
function updateCharCount() {
  const count = elements.content.value.length;
  elements.charCount.textContent = `${count.toLocaleString()} 字符`;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);
