# Zealtime

Zealtime is a lightweight, React-like templating system that enables real-time HTML updates through state changes. It provides reactive state management with automatic DOM updates and optional WebSocket integration for server-driven updates.

## Installation

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zealtime.js"></script>
```

## Core Concepts

### The `z` Object

Zealtime exposes a global `z` object that serves as both:
1. A reactive state container
2. The template API

```javascript
// State management
z.username = "John"     // Set state
console.log(z.username) // Get state

// Template API
z.create("template-name", { data: "value" })
```

### Template Syntax

Templates are HTML elements with the `z` attribute. They are hidden by default and used as blueprints for creating instances.

```html
<!-- Template definition (hidden) -->
<div z="user-card">
    <h2>$(username)</h2>
    <p>$(bio)</p>
</div>
```

### Interpolation Syntax

Use `$(variableName)` to interpolate state values in:
- Text content
- Attribute values

```html
<span>Hello, $(name)!</span>
<input type="text" value="$(name)">
<button onclick="greet('$(name)')">Say Hi</button>
```

## Basic Usage

### Global State

Set state directly on the `z` object. Changes automatically update all DOM elements using that state.

```html
<h1>Counter: $(count)</h1>
<button onclick="z.count++">Increment</button>

<script type="module">
    import "https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zealtime.js"
    z.count = 0
</script>
```

### Creating Template Instances

```html
<!-- Template -->
<div z="message">
    <h2>$(username)</h2>
    <p>$(content)</p>
</div>

<script>
    // Create instance with data
    z.create("message", {
        username: "Alice",
        content: "Hello, world!"
    })
</script>
```

The template instance:
- Removes the `z` attribute
- Adds a `zid` attribute (unique identifier)
- Adds a `z-template` attribute (template name reference)
- Is appended after the template element

## API Reference

### Template Methods

#### `z.create(template, data)`

Creates a template instance and appends it to the DOM (after the template element).

**Parameters:**
- `template` (string): Name of the template (value of `z` attribute)
- `data` (object, optional): Instance-specific state

**Returns:** The cloned DOM element

```javascript
const element = z.create("user-card", {
    username: "Bob",
    role: "Admin"
})
```

#### `z.createIn(template, parent, data)`

Creates a template instance inside a parent element.

**Parameters:**
- `template` (string): Template name
- `parent` (string|Element): CSS selector or DOM element
- `data` (object, optional): Instance-specific state

**Returns:** The cloned DOM element

```javascript
// Using CSS selector
z.createIn("list-item", "#my-list", { text: "Item 1" })

// Using DOM element
z.createIn("list-item", document.querySelector("#my-list"), { text: "Item 2" })
```

#### `z.createAfter(template, after, data)`

Creates a template instance after a specified element.

**Parameters:**
- `template` (string): Template name
- `after` (string|Element): CSS selector or DOM element
- `data` (object, optional): Instance-specific state

**Returns:** The cloned DOM element

```javascript
z.createAfter("note", "#section-header", { text: "Important note" })
```

#### `z.createTemplate(template, data)`

Creates a template instance without appending it to the DOM.

**Parameters:**
- `template` (string): Template name
- `data` (object, optional): Instance-specific state

**Returns:** Object with:
- `clone`: The cloned DOM element
- `zid`: The unique instance ID
- `templateElement`: The original template element

```javascript
const { clone, zid } = z.createTemplate("card", { title: "My Card" })
// Manually append where needed
document.querySelector("#container").appendChild(clone)
```

#### `z.delete(zid)`

Removes a template instance from the DOM and its state.

**Parameters:**
- `zid` (string): The instance ID (from `zid` attribute)

```javascript
z.delete("abc123xyz")
```

#### `z.getTemplate(template)`

Retrieves the template element by name.

**Parameters:**
- `template` (string): Template name

**Returns:** The template DOM element

```javascript
const templateEl = z.getTemplate("user-card")
```

### WebSocket

#### `z.connect(url)`

Establishes a WebSocket connection for real-time state updates.

**Parameters:**
- `url` (string): WebSocket server URL

**Returns:** A `Zocket` instance

```javascript
const socket = z.connect("ws://localhost:8765")
```

### Internals

The `z.internals` object exposes internal functions for advanced use cases:

| Property | Type | Description |
|----------|------|-------------|
| `render()` | Function | Manually trigger a full re-render |
| `renderElement(element, data)` | Function | Render a single element |
| `stateListeners` | Set | State keys being watched |
| `modifications` | Map | Text node modifications |
| `attrModifications` | Map | Attribute modifications |

```javascript
// Force re-render
z.internals.render()
```

## Instance State

Each template instance has its own state accessible via `z[zid]`.

```html
<div z="counter">
    <span>Count: $(count)</span>
    <button onclick="increment('$(zid)')">+</button>
</div>

<script>
    function increment(zid) {
        z[zid].count++
    }

    z.create("counter", { count: 0 })
    z.create("counter", { count: 10 })
</script>
```

### State Inheritance

Instance rendering uses merged state: `{ ...globalState, ...instanceState, zid }`

Priority (highest to lowest):
1. Instance-specific state (`z[zid]`)
2. Global state (`z`)
3. Original placeholder (stays as `$(key)` if not found)

## Nested Templates

Templates can be nested using dynamic `z` attributes:

```html
<div z="message">
    <h3>$(username)</h3>
    <p>$(content)</p>
    <button onclick="addReaction('$(zid)')">Add Reaction</button>

    <!-- Nested template scoped to parent -->
    <div z="reaction-$(zid)">
        <span>$(emoji)</span>
    </div>
</div>

<script>
    const msg = z.create("message", {
        username: "Alice",
        content: "Hello!"
    })

    function addReaction(messageZid) {
        z.create(`reaction-${messageZid}`, { emoji: "👍" })
    }
</script>
```

## WebSocket Integration

### Client Setup

```javascript
z.connect("ws://localhost:8765")
```

### Server Protocol

The server sends JSON messages to update state:

```json
{
    "z": "set",
    "variables": {
        "status": "online",
        "count": 42
    }
}
```

### Automatic Reconnection

The `Zocket` class automatically attempts to reconnect every 1 second when the connection is closed or encounters an error.

### Python Server Example

```python
import asyncio
import websockets

async def handler(websocket):
    # Send initial state
    await websocket.send('{"z": "set", "variables": {"status": "connected"}}')

    # Send updates
    count = 0
    while True:
        count += 1
        await websocket.send(f'{{"z": "set", "variables": {{"count": {count}}}}}')
        await asyncio.sleep(1)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()

asyncio.run(main())
```

## Event Handling

Use interpolation in event attributes:

```html
<div z="item">
    <span>$(name)</span>
    <button onclick="edit('$(zid)')">Edit</button>
    <button onclick="remove('$(zid)')">Delete</button>
    <input oninput="updateName('$(zid)', this.value)" value="$(name)">
</div>

<script>
    function edit(zid) {
        console.log("Editing:", z[zid])
    }

    function remove(zid) {
        z.delete(zid)
    }

    function updateName(zid, value) {
        z[zid].name = value
    }
</script>
```

## Two-Way Binding

Implement two-way binding with `oninput`:

```html
<h1>Hello, $(name)!</h1>
<input type="text" value="$(name)" oninput="z.name = this.value">

<script>
    z.name = "World"
</script>
```

## Attribute Interpolation

State can be interpolated in any attribute:

```html
<div z="status-indicator">
    <span style="color: $(color)">$(status)</span>
    <a href="/user/$(userId)">Profile</a>
    <img src="$(avatarUrl)" alt="$(username)'s avatar">
</div>

<script>
    z.create("status-indicator", {
        color: "green",
        status: "Online",
        userId: 123,
        username: "Alice",
        avatarUrl: "/avatars/alice.png"
    })
</script>
```

## Styling

Templates with the `z` attribute are automatically hidden:

```css
/* Injected by Zealtime */
[z]:not([z-display]) {
    display: none;
}
```

The `z-display` attribute can be used to temporarily show a template (used internally for measurements).

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module" src="https://cdn.jsdelivr.net/gh/zalo-alex/zutils/lib/zealtime.js"></script>
    <style>
        .message { border: 1px solid #ccc; padding: 10px; margin: 5px 0; }
        .message h3 { margin: 0 0 5px 0; }
    </style>
</head>
<body>
    <h1>Messages ($(count))</h1>

    <input type="text" id="username" placeholder="Username">
    <input type="text" id="content" placeholder="Message">
    <button onclick="addMessage()">Send</button>

    <div id="messages">
        <div class="message" z="message">
            <h3>$(username)</h3>
            <p>$(content)</p>
            <small>$(timestamp)</small>
            <button onclick="z.delete('$(zid)')">Delete</button>
        </div>
    </div>

    <script>
        z.count = 0

        function addMessage() {
            const username = document.getElementById("username").value
            const content = document.getElementById("content").value

            z.create("message", {
                username: username || "Anonymous",
                content: content,
                timestamp: new Date().toLocaleString()
            })

            z.count++
            document.getElementById("content").value = ""
        }
    </script>
</body>
</html>
```

## Best Practices

1. **Keep templates simple** - Complex logic should be in JavaScript, not templates
2. **Use instance state** - Prefer `z[zid].property` over global state for instance-specific data
3. **Clean up instances** - Call `z.delete(zid)` when removing elements to prevent memory leaks
4. **Namespace nested templates** - Use `z="child-$(zid)"` to scope nested templates to their parent

## See Also

- [ZProcess](zprocess.md) - HTML preprocessing
- [ZPages](zpages.md) - A4 document generation (uses Zealtime for headers/footers)