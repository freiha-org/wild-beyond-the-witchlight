const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const SOURCE_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(__dirname, '..', '_site');

// Directories to exclude from processing
const EXCLUDE_DIRS = ['.git', '.github', 'node_modules', 'scripts', '_site'];

// Convert Obsidian wikilinks [[Link]] or [[Link|Display]] to HTML links
function convertWikilinks(content) {
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?]]/g, (match, link, display) => {
    const text = display || link;
    const href = link.replace(/ /g, '%20') + '.html';
    return `<a href="${href}">${text}</a>`;
  });
}

// HTML template with dark mode support
function wrapHtml(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --bg: #fafafa;
      --bg-secondary: #f0f0f0;
      --text: #333;
      --text-muted: #666;
      --accent: #5c6bc0;
      --border: #ddd;
      --heading: #2c3e50;
    }

    [data-theme="dark"] {
      --bg: #1a1a2e;
      --bg-secondary: #16213e;
      --text: #e4e4e4;
      --text-muted: #a0a0a0;
      --accent: #7c8ce0;
      --border: #3a3a5a;
      --heading: #f0f0f0;
    }

    * { box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 850px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.7;
      color: var(--text);
      background: var(--bg);
      transition: background 0.3s, color 0.3s;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    nav a {
      font-weight: 500;
      text-decoration: none;
    }

    #theme-toggle {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s;
    }

    #theme-toggle:hover {
      background: var(--border);
    }

    a { color: var(--accent); }
    a:hover { text-decoration: underline; }

    h1, h2, h3, h4 {
      color: var(--heading);
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }

    h1 { border-bottom: 2px solid var(--accent); padding-bottom: 0.5rem; }

    pre {
      background: var(--bg-secondary);
      padding: 1rem;
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    code {
      background: var(--bg-secondary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9em;
    }

    pre code { background: none; padding: 0; }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5rem 0;
      overflow-x: auto;
      display: block;
    }

    th, td {
      border: 1px solid var(--border);
      padding: 0.75rem;
      text-align: left;
    }

    th { background: var(--bg-secondary); font-weight: 600; }
    tr:hover { background: var(--bg-secondary); }

    blockquote {
      border-left: 4px solid var(--accent);
      margin: 1.5rem 0;
      padding: 0.5rem 1rem;
      color: var(--text-muted);
      background: var(--bg-secondary);
      border-radius: 0 8px 8px 0;
    }

    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 1.5rem 0;
    }

    img { max-width: 100%; border-radius: 8px; }

    ul, ol { padding-left: 1.5rem; }
    li { margin: 0.25rem 0; }
  </style>
</head>
<body>
  <header>
    <nav><a href="/index.html">Home</a></nav>
    <button id="theme-toggle" aria-label="Toggle dark mode">Toggle Theme</button>
  </header>
  <hr>
  <main>${content}</main>
  <script>
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check saved preference or system preference
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    html.setAttribute('data-theme', theme);

    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  </script>
</body>
</html>`;
}

// Get all markdown files recursively
function getMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        getMarkdownFiles(fullPath, files);
      }
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main conversion function
function convert() {
  // Clean and create output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const mdFiles = getMarkdownFiles(SOURCE_DIR);
  console.log(`Found ${mdFiles.length} markdown files`);

  for (const file of mdFiles) {
    const relativePath = path.relative(SOURCE_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, relativePath.replace(/\.md$/, '.html'));
    const outputDir = path.dirname(outputPath);

    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Read and convert
    let content = fs.readFileSync(file, 'utf-8');
    content = convertWikilinks(content);
    const html = marked(content);

    // Get title from first heading or filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(file, '.md');

    // Write output
    fs.writeFileSync(outputPath, wrapHtml(title, html));
    console.log(`Converted: ${relativePath}`);
  }

  console.log(`\nBuild complete! Output: ${OUTPUT_DIR}`);
}

convert();
