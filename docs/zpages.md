# ZPages

ZPages is a document generation library that creates printable A4 documents in HTML/CSS. It provides automatic pagination, headers/footers with page numbers, automatic heading numbering, and table of contents generation.

## Installation

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zpages.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zpages.css">
```

Note: ZPages automatically includes Zealtime and ZProcess as dependencies.

## Core Concepts

### Document Structure

A ZPages document consists of:
- A `<header>` template (optional)
- A `<footer>` template (optional)
- A `<pages>` container with `<page>` elements

```html
<header z="header">...</header>
<footer z="footer">...</footer>

<pages>
    <page>...</page>
    <page>...</page>
</pages>
```

### A4 Aspect Ratio

Pages maintain A4 aspect ratio (1:1.4142) and scale responsively:
- Maximum width: 800px
- Height adjusts automatically to maintain ratio
- Responsive scaling on smaller screens

## Basic Usage

### Minimal Document

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zpages.css">
</head>
<body>
    <pages>
        <page>
            <h1>My Document</h1>
            <p>Hello, World!</p>
        </page>
    </pages>

    <script type="module" src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zpages.js"></script>
</body>
</html>
```

### Document with Headers and Footers

```html
<header z="header">
    <span>Document Title</span>
    <span>Author Name</span>
</header>

<footer z="footer">
    <span>Confidential</span>
    <span>Page $(page) of $(pageTotal)</span>
</footer>

<pages>
    <page>
        <h1>Introduction</h1>
        <p>Content here...</p>
    </page>
    <page>
        <h1>Chapter 1</h1>
        <p>More content...</p>
    </page>
</pages>
```

## Headers and Footers

### Template Definition

Headers and footers use Zealtime templates with `z="header"` and `z="footer"`:

```html
<header z="header">
    <span>Left Content</span>
    <span>Right Content</span>
</header>

<footer z="footer">
    <span>Footer Left</span>
    <span>Footer Right</span>
</footer>
```

### Available Variables

Inside header/footer templates:

| Variable | Description |
|----------|-------------|
| `$(page)` | Current page number (1-indexed) |
| `$(pageTotal)` | Total number of pages |

```html
<footer z="footer">
    <span>Page $(page) of $(pageTotal)</span>
</footer>
```

### Skipping Headers/Footers

Use `no-header` and `no-footer` attributes to skip on specific pages:

```html
<!-- Title page without header/footer -->
<page no-header no-footer>
    <h1>Document Title</h1>
</page>

<!-- Normal page -->
<page>
    <h1>Chapter 1</h1>
</page>
```

### Default Styling

Headers and footers are:
- Positioned absolutely (top/bottom)
- Flexbox with `justify-content: space-between`
- Padding: `var(--z-20px) var(--z-40px)`

## Automatic Header Numbering

Headers (h1-h6) are automatically numbered with hierarchical indices.

### How It Works

```html
<page>
    <h1>Introduction</h1>        <!-- Becomes: 1. Introduction -->
    <h2>Background</h2>          <!-- Becomes: 1.1. Background -->
    <h2>Goals</h2>               <!-- Becomes: 1.2. Goals -->
    <h3>Primary Goals</h3>       <!-- Becomes: 1.2.1. Primary Goals -->
</page>
<page>
    <h1>Methods</h1>             <!-- Becomes: 2. Methods -->
    <h2>Data Collection</h2>     <!-- Becomes: 2.1. Data Collection -->
</page>
```

### Skipping Numbering

Use `no-index` to exclude a header from automatic numbering:

```html
<page no-header no-footer>
    <h1 no-index>Document Title</h1>  <!-- No number prefix -->
    <h2 no-index>Subtitle</h2>        <!-- No number prefix -->
</page>
```

### Index Reset

The index counter resets when `zpages.updatePages()` runs.

## Table of Contents

Add `<contents></contents>` to generate an automatic table of contents.

### Basic Usage

```html
<page>
    <contents></contents>
</page>
```

### Generated Structure

```html
<div class="contents">
    <a href="#abc123" class="level-1 header">
        <span class="header-title">1. Introduction</span>
        <div class="separator"></div>
        <span class="page-index">1</span>
    </a>
    <a href="#def456" class="level-2 header">
        <span class="header-title">1.1. Background</span>
        <div class="separator"></div>
        <span class="page-index">1</span>
    </a>
    <!-- ... -->
</div>
```

### Features

- Clickable links to each header
- Automatic page numbers
- Level-based CSS classes (`level-1`, `level-2`, etc.)
- Dashed separator line between title and page number

### Styling

Default TOC styling:
```css
.contents .header {
    display: flex;
    align-items: center;
    gap: 20px;
    color: #000;
    text-decoration: none;
}

.contents .header-title {
    white-space: nowrap;
}

.contents .separator {
    width: 100%;
    border-bottom: 1px dashed #000;
}
```

## Automatic Page Breaking

When content overflows a page, ZPages automatically:
1. Creates a new page
2. Moves overflowing content to the new page
3. Adds headers/footers to the new page
4. Updates page numbers
5. Recursively handles overflow in new pages

### Disabling Page Breaks

Use `no-page-break` to prevent automatic page breaking:

```html
<page no-page-break>
    <!-- Content will overflow but won't create new page -->
    <h1>Title</h1>
    <div style="height: 2000px;">Tall content</div>
</page>
```

### Overflow Indicator

When a page has `no-page-break` and overflows:
- A red outline appears around the page
- An "Overflowing" label is shown at the top

Hide the indicator with `no-overflow-indicator`:

```html
<page no-page-break no-overflow-indicator>
    <!-- Overflow won't show visual indicator -->
</page>
```

## Responsive Sizing

ZPages provides responsive CSS variables that scale with viewport width.

### How It Works

Use `--z-<pixels>` in your CSS:

```css
h1 { font-size: var(--z-40); }   /* Max 40px, scales down */
h2 { font-size: var(--z-32); }
h3 { font-size: var(--z-24); }
p  { font-size: var(--z-16); }
```

The formula: `min(calc(<pixels>/800 * 100vw), <pixels>px)`

At 800px viewport or wider, values are exact pixel sizes. Below 800px, they scale proportionally.

### Built-in Sizes

The default stylesheet uses:
- `--z-40px` for h1
- `--z-32px` for h2
- `--z-24px` for h3
- `--z-16px` for p, span
- `--z-20px`, `--z-10px`, `--z-5px` for spacing

## API Reference

### `zpages.updatePages()`

Main function that initializes/updates the document.

**Actions performed:**
1. Generates responsive CSS variables
2. Sets header/footer heights
3. Adds headers/footers to all pages
4. Runs ZProcess preprocessors (heading numbering, TOC)
5. Triggers Zealtime rendering
6. Handles page overflow and automatic breaking
7. Updates page numbers

Called automatically on `window.load`.

```javascript
// Manual update
zpages.updatePages()
```

### Global State

| Variable | Description |
|----------|-------------|
| `z.headerHeight` | Height of header template in pixels |
| `z.footerHeight` | Height of footer template in pixels |
| `z.pageTotal` | Total number of pages |

### Page Attributes

| Attribute | Description |
|-----------|-------------|
| `zpage-index` | Page index (0-based), set automatically |

```javascript
const page = document.querySelector("page")
const index = page.getAttribute("zpage-index")  // "0"
```

## Freezing Documents

For exported HTML files that shouldn't re-render, use the freeze flag:

```html
<script>window.zpagesFreeze = true</script>
<script type="module" src="zpages.js"></script>
```

When frozen:
- Responsive CSS variables are still generated
- Header/footer heights are calculated
- **No** automatic pagination runs
- **No** preprocessors run
- **No** page breaking occurs

This is useful for:
- Saving rendered documents as static HTML
- PDF export workflows
- Sharing documents without ZPages installed

## Print Support

ZPages includes comprehensive print styles:

```css
@media print {
    @page {
        size: A4;
        margin: 0;
    }

    page {
        width: 100%;
        height: 100vh;
        page-break-after: always;
    }
}
```

### Features

- A4 page size
- Proper page breaks between pages
- Colors preserved (`print-color-adjust: exact`)
- Shadows and decorations removed
- Overflow indicators hidden

### Printing

Simply use the browser's print function (Ctrl+P / Cmd+P) or:

```javascript
window.print()
```

## Element Reference

### `<pages>`

Container for all pages. Provides:
- Flexbox column layout
- Gap between pages
- Drop shadow styling

### `<page>`

Individual page element with:
- A4 aspect ratio
- White background
- Automatic overflow handling
- Header/footer padding

**Attributes:**

| Attribute | Description |
|-----------|-------------|
| `no-header` | Skip header on this page |
| `no-footer` | Skip footer on this page |
| `no-page-break` | Prevent automatic page breaking |
| `no-overflow-indicator` | Hide overflow warning |

### `<contents>`

Generates table of contents. Should be placed inside a `<page>`.

### `<header z="header">`

Header template. Use Zealtime interpolation for dynamic content.

### `<footer z="footer">`

Footer template. Use Zealtime interpolation for dynamic content.

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Annual Report 2024</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zpages.css">
    <style>
        body { font-family: Georgia, serif; }
        h1 { color: #333; margin-bottom: 20px; }
        h2 { color: #666; margin: 15px 0; }
        p { line-height: 1.6; margin-bottom: 10px; }
        .title-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .title-page h1 { font-size: var(--z-48); }
        .title-page h2 { font-size: var(--z-24); color: #999; }
    </style>
</head>
<body>
    <header z="header">
        <span>Annual Report 2024</span>
        <span>ACME Corporation</span>
    </header>

    <footer z="footer">
        <span>Confidential</span>
        <span>Page $(page) of $(pageTotal)</span>
    </footer>

    <pages>
        <!-- Title Page -->
        <page no-header no-footer class="title-page">
            <h1 no-index>Annual Report</h1>
            <h2 no-index>Fiscal Year 2024</h2>
            <p>ACME Corporation</p>
        </page>

        <!-- Table of Contents -->
        <page>
            <h1 no-index>Table of Contents</h1>
            <contents></contents>
        </page>

        <!-- Executive Summary -->
        <page>
            <h1>Executive Summary</h1>
            <p>This report presents the financial performance and strategic
            achievements of ACME Corporation during fiscal year 2024.</p>

            <h2>Key Highlights</h2>
            <p>Revenue increased by 15% compared to the previous year.</p>

            <h2>Strategic Initiatives</h2>
            <p>We launched three new product lines and expanded into two
            new markets.</p>
        </page>

        <!-- Financial Results -->
        <page>
            <h1>Financial Results</h1>

            <h2>Revenue</h2>
            <p>Total revenue reached $10.5 million, representing a 15%
            increase year-over-year.</p>

            <h2>Operating Expenses</h2>
            <p>Operating expenses were maintained at $6.2 million through
            efficiency improvements.</p>

            <h2>Net Income</h2>
            <p>Net income of $3.1 million represents a 22% increase from
            the prior year.</p>
        </page>

        <!-- Future Outlook -->
        <page>
            <h1>Future Outlook</h1>

            <h2>Growth Projections</h2>
            <p>We project 20% revenue growth in the coming fiscal year.</p>

            <h2>Investment Plans</h2>
            <p>$2 million allocated for R&D and infrastructure improvements.</p>

            <h2>Market Expansion</h2>
            <p>Plans to enter three additional international markets.</p>
        </page>
    </pages>

    <script type="module" src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zpages.js"></script>
</body>
</html>
```

## Best Practices

1. **Use semantic headers** - Proper h1-h6 hierarchy for correct numbering
2. **Plan page breaks** - Consider natural break points in content
3. **Test print output** - Use print preview to verify page breaks
4. **Use `no-index` for non-content headers** - Title pages, TOC headers, etc.
5. **Keep content per page reasonable** - Very long pages may cause performance issues during overflow calculation

## Troubleshooting

### Headers/Footers Not Appearing

- Ensure templates have `z="header"` and `z="footer"` attributes
- Check that ZPages script is loaded as a module
- Verify no JavaScript errors in console

### Page Numbers Show $(page)

- Zealtime may not have loaded properly
- Check script load order (Zealtime before ZPages)

### Content Not Breaking Properly

- Check for `no-page-break` attribute
- Ensure content elements are direct children of `<page>`
- Absolute positioned elements are not moved during page breaks

### Print Layout Issues

- Use browser's print preview
- Check `@media print` styles aren't overridden
- Ensure no custom page-break CSS conflicts

## See Also

- [Zealtime](zealtime.md) - Template system used for headers/footers
- [ZProcess](zprocess.md) - Preprocessing used for heading numbers and TOC