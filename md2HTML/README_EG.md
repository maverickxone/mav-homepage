# md2HTML

A Markdown-to-HTML static site generator that converts a collection of Markdown chapter files into a beautiful documentation site with a minimal black/white design system.

## Features

- **Markdown → HTML** conversion with `marked`
- **Frontmatter** parsing with `gray-matter`
- **Extended syntax**: callouts, tabs, collapsible sections
- **Auto-generated**: navigation, sidebar TOC, chapter pager (prev/next)
- **Dark/light theme** toggle with persistence
- **Reading progress** bar and chapter completion tracking
- **Search** across all chapters (Ctrl+K / ⌘K)
- **Syntax highlighting** via highlight.js
- **Responsive** design with mobile TOC drawer
- **Zero build tools** — just `node build.js`

## Quick Start

```bash
# Install dependencies
npm install

# Build the site
node build.js

# Open in browser
open dist/index.html
```

## Project Structure

```
md2HTML/
├── build.js          # Build script
├── package.json      # Dependencies
├── content/          # Your content
│   ├── book.yaml     # Book metadata (title, author, etc.)
│   └── *.md          # Chapter files
├── templates/        # HTML templates
│   ├── index.html    # Index page template
│   └── chapter.html  # Chapter page template
├── assets/           # Static assets (copied to dist/)
│   ├── style.css     # Design system
│   └── script.js     # Interactions
└── dist/             # Build output (auto-generated)
```

## Writing Content

### Book Configuration

Edit `content/book.yaml`:

```yaml
title: "My Documentation"
author: "Author Name"
description: "A brief description of the book."
language: "EN"
```

### Chapter Files

Create `.md` files in `content/` with YAML frontmatter:

```markdown
---
title: Chapter Title
chapter: 1
readTime: 20
description: Brief description for the index card.
---

## Section Heading

Your content here...
```

Chapters are sorted by the `chapter` frontmatter field.

### Extended Syntax

#### Callouts

```markdown
:::callout Title
Content goes here.
:::

:::callout-tip Tip Title
Helpful tip content.
:::

:::callout-warn Warning Title
Warning content.
:::
```

#### Tabs

```markdown
:::tabs Tab1 | Tab2 | Tab3
::tab Tab1
Content for tab 1.
::tab Tab2
Content for tab 2.
::tab Tab3
Content for tab 3.
:::
```

#### Collapsible Sections

```markdown
:::collapsible Click to expand
Hidden content that can be toggled.
:::
```

#### Custom Heading IDs

```markdown
## My Section {#custom-id}
```

## Customization

- **Templates**: Edit `templates/index.html` and `templates/chapter.html`
- **Styles**: Modify `assets/style.css` (uses CSS custom properties for theming)
- **Scripts**: Extend `assets/script.js` for additional interactions

## Output

The `dist/` directory contains a complete static site:

- Works with `file://` protocol (no server needed)
- Can be served with any static file server
- Deploy to GitHub Pages, Netlify, Vercel, etc.

## Dependencies

- `marked` — Markdown to HTML conversion
- `gray-matter` — YAML frontmatter parsing
- `js-yaml` — YAML file parsing

## License

MIT
