# ZUtils Documentation


> [!WARNING]
> This documentation have been AI generated, not all of the informations are right, this documentation have for only goal to explain most important things of this lib.

ZUtils is a lightweight JavaScript library suite for modern web development, consisting of three composable tools:

| Component | Description |
|-----------|-------------|
| [Zealtime](zealtime.md) | Reactive templating with real-time updates and WebSocket support |
| [ZProcess](zprocess.md) | HTML preprocessing engine for DOM transformations |
| [ZPages](zpages.md) | A4 document generation with automatic pagination |

## Quick Start

### Installation

Include via CDN (jsdelivr):

```html
<!-- Zealtime only -->
<script type="module" src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zealtime.js"></script>

<!-- ZProcess only -->
<script src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zprocess.js"></script>

<!-- ZPages (includes Zealtime & ZProcess) -->
<script type="module" src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zpages.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zpages.css">
```

### Minimal Example

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module" src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zealtime.js"></script>
</head>
<body>
    <h1>Hello, $(name)!</h1>

    <script>
        z.name = "World"
    </script>
</body>
</html>
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                       ZPages                            │
│   (A4 documents, pagination, headers/footers, TOC)      │
├─────────────────────────────────────────────────────────┤
│          Zealtime           │        ZProcess           │
│  (reactive state, templates │   (HTML preprocessing)    │
│   WebSocket integration)    │                           │
└─────────────────────────────┴───────────────────────────┘
```

- **Zealtime** and **ZProcess** are independent libraries
- **ZPages** builds on top of both for document generation
- Each can be used standalone or combined

## Global Objects

When loaded, each library exposes a global object:

| Library | Global | Description |
|---------|--------|-------------|
| Zealtime | `z` | State object and template API |
| ZProcess | `zp` | Preprocessor registration API |
| ZPages | `zpages` | Page management API |

## Component Comparison

| Feature | Zealtime | ZProcess | ZPages |
|---------|----------|----------|--------|
| State management | Yes | No | Via Zealtime |
| DOM templates | Yes | No | Via Zealtime |
| Text interpolation | Yes | No | Via Zealtime |
| HTML transformation | No | Yes | Via ZProcess |
| WebSocket support | Yes | No | No |
| A4 pagination | No | No | Yes |
| Auto page breaks | No | No | Yes |
| Headers/footers | No | No | Yes |
| Table of contents | No | No | Yes |

## Building from Source

Each component has its own package.json with an esbuild configuration:

```bash
# Build Zealtime
cd zealtime && npm install && npm run build

# Build ZProcess
cd zprocess && npm install && npm run build

# Build ZPages
cd zpages && npm install && npm run build
```

Output files are placed in the `/lib/` directory.

## Project Structure

```
zutils/
├── zealtime/
│   ├── src/
│   │   ├── index.js        # Main API and rendering
│   │   ├── deepProxy.js    # Reactive proxy implementation
│   │   └── zocket.js       # WebSocket wrapper
│   ├── examples/
│   │   ├── index.html      # Interactive demo
│   │   ├── app.js          # Demo JavaScript
│   │   └── app.py          # WebSocket server example
│   └── package.json
│
├── zprocess/
│   ├── src/
│   │   └── index.js        # Preprocessor API
│   ├── examples/
│   │   ├── index.html      # Transform examples
│   │   └── app.js          # Preprocessor definitions
│   └── package.json
│
├── zpages/
│   ├── src/
│   │   ├── index.js        # Pagination and page logic
│   │   └── style.css       # A4 styling and print media
│   ├── examples/
│   │   └── index.html      # Document example
│   └── package.json
│
├── lib/                     # Built output
│   ├── zealtime.js
│   ├── zprocess.js
│   ├── zpages.js
│   └── zpages.css
│
└── docs/                    # Documentation
    ├── index.md
    ├── zealtime.md
    ├── zprocess.md
    └── zpages.md
```

## Browser Support

ZUtils uses modern JavaScript features:
- ES6 Modules (`import`/`export`)
- Proxy API
- Template literals
- Arrow functions
- `const`/`let`

Supported in all modern browsers (Chrome, Firefox, Safari, Edge).

## Next Steps

- [Zealtime Documentation](zealtime.md) - Reactive templates and state
- [ZProcess Documentation](zprocess.md) - HTML preprocessing
- [ZPages Documentation](zpages.md) - A4 document generation
