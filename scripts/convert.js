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

// Simple HTML template
function wrapHtml(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
      background: #fafafa;
    }
    a { color: #5c6bc0; }
    pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; border-radius: 4px; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
    blockquote { border-left: 4px solid #5c6bc0; margin: 1rem 0; padding-left: 1rem; color: #666; }
    hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
    h1, h2, h3 { color: #2c3e50; }
  </style>
</head>
<body>
  <nav><a href="/index.html">Home</a></nav>
  <hr>
  ${content}
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
