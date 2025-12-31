# AI Output Clipper

A Chrome extension for quickly saving AI-generated content to your GitHub-powered blog.

## Features

- Quick content capture from ChatGPT, Claude, and other AI tools
- Direct publishing to GitHub repositories
- Automatic markdown file formatting with frontmatter
- Chinese character support (UTF-8 encoding)
- Configurable target paths and file naming
- Dark mode support

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `extension` directory

### Chrome Web Store (Future)

Coming soon!

## Setup

### 1. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Grant permissions:
   - `repo` (for private repositories)
   - OR `public_repo` (for public repositories only)
4. Generate and copy the token (starts with `ghp_`)

### 2. Configure the Extension

1. Click the extension icon in Chrome toolbar
2. Expand "GitHub 配置" section
3. Fill in:
   - **Token**: Paste your GitHub PAT
   - **仓库地址**: Your blog repository URL (e.g., `https://github.com/jclio-my/ai_output_retention`)
4. Click "保存配置"
5. Optional: Click "测试连接" to verify

## Usage

1. Copy content from ChatGPT or any AI tool
2. Click the extension icon
3. Enter a title (this will be the filename)
4. Paste your markdown content
5. Click "发布到博客"
6. Wait for the success message
7. Your blog will update automatically via Cloudflare Pages

## Advanced Configuration

### Date Prefix

By default, filenames include date prefix (e.g., `2024-12-30-my-post.md`).
To disable: Uncheck "文件名添加日期前缀"

Posts are always saved to the `posts/` directory in your repository.

## File Format

Created files follow this format:

```markdown
---
title: "Your Title"
date: "2024-12-30"
---

Your content here...
```

This format is compatible with the [AI Output Retention](https://github.com/jclio-my/ai_output_retention) blog system.

## Troubleshooting

### "Token 无效或已过期"
- Regenerate your GitHub Personal Access Token
- Ensure token has `repo` or `public_repo` scope

### "仓库不存在或无权访问"
- Verify your username and repository name
- Check token has correct permissions
- For private repos, ensure token has `repo` scope

### "文件已存在"
- Change the title slightly
- The extension doesn't overwrite existing files

### Chinese characters appearing as gibberish
- This shouldn't happen with current version
- If it does, please open an issue

## Development

### Project Structure

```
extension/
├── manifest.json       # Extension configuration
├── popup.html         # User interface
├── popup.css          # Styles
├── popup.js           # Main logic
├── lib/
│   ├── github-api.js  # GitHub API client
│   ├── encoding.js    # UTF-8 utilities
│   └── slug.js        # Filename generation
└── icons/             # Extension icons
```

### Local Testing

1. Make changes to files
2. Go to `chrome://extensions/`
3. Click reload icon on your extension
4. Test changes

## Security

- Your GitHub token is stored locally using Chrome's `storage.sync` API
- Tokens are encrypted by Chrome and synced across your devices
- Tokens are never sent anywhere except directly to GitHub's API
- The extension only has access to `api.github.com`

## Compatibility

- Chrome 88+
- Edge 88+ (Chromium-based)
- Any Chromium-based browser

## License

MIT

## Author

jclio

## Related Projects

- [AI Output Retention](https://github.com/jclio-my/ai_output_retention) - The blog system this extension publishes to
