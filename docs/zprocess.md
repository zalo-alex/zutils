# ZProcess

ZProcess is a lightweight HTML preprocessing engine that allows you to transform DOM content using CSS selectors and callback functions. It's useful for converting shorthand markup, applying text transformations, and creating custom HTML syntaxes.

## Installation

```html
<script src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zprocess.js"></script>
```

Note: ZProcess is a regular script (not an ES module) and exposes the global `zp` object.

## Core Concepts

### Preprocessors

A preprocessor is a combination of:
1. A CSS selector to match elements
2. A callback function that transforms the content
3. A mode (inner or outer HTML replacement)

### Processing Flow

1. Preprocessors are registered with `zp.pre()`
2. On `window.load`, all preprocessors run automatically
3. Original HTML is preserved for potential re-processing
4. Multiple preprocessors can be chained on the same elements

## Basic Usage

### Simple Text Transformation

```html
<span class="uppercase">hello world</span>

<script>
    zp.pre(".uppercase", ({text}) => text.toUpperCase())
</script>
```

Result: `<span class="uppercase">HELLO WORLD</span>`

### Creating List from Text Lines

```html
<div class="list">
Apple
Banana
Cherry
</div>

<script>
    // Convert each line to a <li>
    zp.pre(".list", ({lines}) => lines.map(line => `<li>${line}</li>`))

    // Wrap with <ul> (replaces outer HTML)
    zp.pre(".list", ({html}) => `<ul>${html}</ul>`, true)
</script>
```

Result:
```html
<ul>
    <li>Apple</li>
    <li>Banana</li>
    <li>Cherry</li>
</ul>
```

## API Reference

### `zp.pre(selector, callback, outer, onWindowLoad)`

Registers a preprocessor.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | string | required | CSS selector to match elements |
| `callback` | function | required | Transform function |
| `outer` | boolean | `false` | If `true`, replaces `outerHTML`; otherwise replaces `innerHTML` |
| `onWindowLoad` | boolean | `true` | If `true`, only runs on window load |

**Returns:** `undefined`

```javascript
// Replace innerHTML (default)
zp.pre(".content", ({text}) => text.toUpperCase())

// Replace outerHTML
zp.pre(".wrapper", ({html}) => `<div class="new-wrapper">${html}</div>`, true)

// Run immediately (not on window load)
zp.pre(".eager", ({text}) => text.trim(), false, false)
```

### `zp.runPreprocessor(selector, callback, outer)`

Manually runs a single preprocessor.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | string | CSS selector to match elements |
| `callback` | function | Transform function |
| `outer` | boolean | Outer/inner HTML mode |

```javascript
zp.runPreprocessor(".highlight", ({text}) => `<mark>${text}</mark>`, false)
```

### `zp.runPreprocessors(windowLoad)`

Runs all registered preprocessors.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `windowLoad` | boolean | `false` | If `true`, only runs preprocessors with `onWindowLoad=true` |

```javascript
// Run all preprocessors
zp.runPreprocessors()

// Run only window-load preprocessors
zp.runPreprocessors(true)
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `zp.preprocessors` | Array | List of registered preprocessors `[selector, callback, outer, onWindowLoad]` |
| `zp.originals` | Map | Original HTML stored for each processed element |

## Callback Function

The callback receives an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `text` | string | Trimmed text content (`element.textContent.trim()`) |
| `lines` | string[] | Text split by newlines |
| `html` | string | Inner HTML (`element.innerHTML`) |
| `outer` | string | Outer HTML (`element.outerHTML`) |
| `element` | Element | The DOM element itself |

### Return Value

The callback should return:
- A **string** - Used as the replacement HTML
- An **array of strings** - Joined together as the replacement HTML

```javascript
// Return string
zp.pre(".bold", ({html}) => `<strong>${html}</strong>`)

// Return array (joined automatically)
zp.pre(".list", ({lines}) => lines.map(l => `<li>${l}</li>`))
```

## Inner vs Outer Mode

### Inner Mode (default)

Replaces the element's `innerHTML` while keeping the element itself.

```html
<div class="box">Hello</div>

<script>
    zp.pre(".box", ({text}) => `<span>${text}!</span>`)
</script>
```

Result: `<div class="box"><span>Hello!</span></div>`

### Outer Mode

Replaces the entire element including its tags.

```html
<div class="box">Hello</div>

<script>
    zp.pre(".box", ({html}) => `<section class="new">${html}</section>`, true)
</script>
```

Result: `<section class="new">Hello</section>`

## Chaining Preprocessors

Multiple preprocessors can be applied to the same elements. They execute in registration order.

```html
<div class="text red">hello</div>

<script>
    // Step 1: Wrap lines in <p> tags
    zp.pre(".text", ({lines}) => lines.map(l => `<p>${l}</p>`))

    // Step 2: Color red text
    zp.pre(".text.red", ({html}) => `<span style="color: red">${html}</span>`)

    // Step 3: Add border (outer mode)
    zp.pre(".text", ({outer}) => `<div style="border: 1px solid">${outer}</div>`, true)
</script>
```

## Original Content Preservation

ZProcess stores the original HTML of each element before processing. This allows:
- Re-running preprocessors with consistent results
- Resetting content if needed

```javascript
// Original HTML is stored in zp.originals Map
const originalHtml = zp.originals.get(element)
```

When a preprocessor runs again on an already-processed element:
1. The original HTML is restored
2. The transformation is applied fresh

## Common Patterns

### Markdown-like Lists

```html
<div class="md-list">
- Item one
- Item two
- Item three
</div>

<script>
    zp.pre(".md-list", ({lines}) =>
        lines
            .filter(l => l.startsWith("- "))
            .map(l => `<li>${l.slice(2)}</li>`)
    )
    zp.pre(".md-list", ({html}) => `<ul>${html}</ul>`, true)
</script>
```

### Text Highlighting

```html
<p class="highlight-code">Use the `print()` function to output text.</p>

<script>
    zp.pre(".highlight-code", ({html}) =>
        html.replace(/`([^`]+)`/g, '<code>$1</code>')
    )
</script>
```

### Automatic Links

```html
<p class="auto-link">Visit https://example.com for more info.</p>

<script>
    zp.pre(".auto-link", ({html}) =>
        html.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1">$1</a>'
        )
    )
</script>
```

### Leet Speak Converter

```html
<span class="leet">hacker elite</span>

<script>
    zp.pre(".leet", ({text}) =>
        text
            .replace(/a/gi, "4")
            .replace(/e/gi, "3")
            .replace(/i/gi, "1")
            .replace(/o/gi, "0")
            .replace(/s/gi, "5")
    )
</script>
```

Result: `h4ck3r 3l1t3`

### Alternating Case

```html
<span class="wave">hello world</span>

<script>
    zp.pre(".wave", ({text}) =>
        text.split("").map((c, i) =>
            i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
        ).join("")
    )
</script>
```

Result: `HeLlO WoRlD`

### Data Tables

```html
<div class="table">
Name | Age | City
Alice | 30 | NYC
Bob | 25 | LA
</div>

<script>
    zp.pre(".table", ({lines}) => {
        const [header, ...rows] = lines
        const headers = header.split("|").map(h => `<th>${h.trim()}</th>`)
        const cells = rows.map(row =>
            `<tr>${row.split("|").map(c => `<td>${c.trim()}</td>`).join("")}</tr>`
        )
        return `<thead><tr>${headers.join("")}</tr></thead><tbody>${cells.join("")}</tbody>`
    })
    zp.pre(".table", ({html}) => `<table>${html}</table>`, true)
</script>
```

## Integration with Zealtime

ZProcess can be used alongside Zealtime. Zealtime interpolation happens after preprocessing.

```html
<div class="greeting">
Hello, $(name)!
Welcome to $(place).
</div>

<script src="zprocess.js"></script>
<script type="module" src="zealtime.js"></script>

<script>
    // ZProcess: wrap in paragraphs
    zp.pre(".greeting", ({lines}) => lines.map(l => `<p>${l}</p>`))
</script>

<script type="module">
    // Zealtime: fill in values
    z.name = "Alice"
    z.place = "Wonderland"
</script>
```

Result:
```html
<div class="greeting">
    <p>Hello, Alice!</p>
    <p>Welcome to Wonderland.</p>
</div>
```

## Manual Execution

By default, preprocessors run on `window.load`. For dynamic content or manual control:

```javascript
// Register without auto-run
zp.pre(".dynamic", callback, false, false)

// Later, run manually
zp.runPreprocessors()

// Or run a specific preprocessor
zp.runPreprocessor(".dynamic", callback, false)
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zprocess.js"></script>
    <style>
        .card { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
        .card h3 { margin: 0 0 10px 0; color: #333; }
        ul { margin: 0; padding-left: 20px; }
        code { background: #f5f5f5; padding: 2px 5px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="title">My Shopping List</div>
        <div class="items">
Apples
Bananas
Milk
Bread
        </div>
    </div>

    <div class="card">
        <div class="title">Code Tip</div>
        <div class="tip">Use `console.log()` for debugging.</div>
    </div>

    <script>
        // Convert titles to h3
        zp.pre(".title", ({html}) => `<h3>${html}</h3>`, true)

        // Convert items to list
        zp.pre(".items", ({lines}) =>
            lines.filter(l => l.trim()).map(l => `<li>${l.trim()}</li>`)
        )
        zp.pre(".items", ({html}) => `<ul>${html}</ul>`, true)

        // Highlight inline code
        zp.pre(".tip", ({html}) =>
            html.replace(/`([^`]+)`/g, '<code>$1</code>')
        )
    </script>
</body>
</html>
```

## Best Practices

1. **Order matters** - Register preprocessors in the order you want them to execute
2. **Use outer mode carefully** - It replaces the entire element, losing the original selector match
3. **Filter empty lines** - Use `.filter(l => l.trim())` to skip blank lines
4. **Keep transforms simple** - Complex logic should use multiple preprocessors
5. **Test with manual execution** - Use `onWindowLoad=false` during development for easier debugging

## See Also

- [Zealtime](zealtime.md) - Reactive templating
- [ZPages](zpages.md) - Uses ZProcess for header numbering and TOC generation