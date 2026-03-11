---
title: "Fix All Broken Tools and Upgrade UI to Compact/Sleek Design"
type: fix
date: 2026-03-11
deepened: 2026-03-11
---

# Fix All Broken Tools and Upgrade UI to Compact/Sleek Design

## Enhancement Summary

**Deepened on:** 2026-03-11
**Sections enhanced:** 14
**Research agents used:** frontend-design skill, security-sentinel, performance-oracle, kieran-typescript-reviewer, architecture-strategist, code-simplicity-reviewer, web research (marked, prettier, curlconverter, js-beautify, x509)

### Key Improvements from Research
1. **Switch Code Beautifier from Prettier (~900KB) to js-beautify (~40KB)** - 22x smaller bundle
2. **curlconverter requires WASM files** (tree-sitter.wasm) - needs custom build config or simpler approach
3. **marked + DOMPurify** is the industry-standard approach for secure markdown rendering
4. **React.lazy() for tool components** - not just library lazy-loading, entire tools should be code-split
5. **Certificate decoder** - `@peculiar/x509` is the best browser-compatible option, lazy-load it

### New Considerations Discovered
- Prettier standalone is ~900KB with babel parser - unacceptable for a browser tool. Use js-beautify (40KB) instead
- curlconverter requires tree-sitter WASM files served from root - complex deployment. Consider writing a better custom parser instead
- The 3-file tool registration pattern (tools-config.ts, tool.tsx imports, tool.tsx componentMap) should be simplified
- HTML Preview should use `srcdoc` attribute instead of blob URLs for cleaner iframe rendering

---

## Overview

11 of 36 developer utility tools are broken or non-functional (mock data, regex-based parsers that fail, XSS vulnerabilities). The UI is also too spacious compared to competitors like DevUtils -- fonts are too large, padding too generous, and information density is low. This plan fixes all broken tools using proper libraries and makes the entire UI compact and professional.

## Problem Statement

1. **Broken tools**: Certificate Decoder returns fake data, Markdown Preview has XSS, Code Beautifier only works for JSON, SQL Formatter breaks syntax, PHP tools fail on real input, cURL parser is fragile, HTML to JSX misses conversions, etc.
2. **Bloated UI**: Title text is 30px, card padding is 24px, grid gaps are 24px, sidebar is 280px -- all ~30-40% larger than needed for a developer tool.

## Proposed Solution

### Phase 1: UI Compactness Overhaul

Reduce all sizing by ~30% across the board. Specific mappings:

#### 1.1 Global Component Sizing Changes

**File: `client/src/components/ui/tool-layout.tsx`**
| Element | Current | Target |
|---------|---------|--------|
| Container spacing | `space-y-8` | `space-y-4` |
| Title margin | `mb-8` | `mb-3` |
| Title font | `text-3xl font-bold` | `text-xl font-semibold` |
| Description | `text-gray-600` | `text-xs text-muted-foreground` |
| Grid gap | `gap-6` | `gap-4` |
| ToolInput/ToolOutput card title | `text-lg` | `text-sm font-medium` |

<details>
<summary>Research Insights: UI Compactness</summary>

**Best Practices (DevUtils-style):**
- Developer tools benefit from **monospace fonts in all code areas** and a **system UI font stack** for the chrome (sidebar, headers, labels)
- Target **13px base font** for content areas, **11-12px for sidebar items** - this matches DevUtils density
- Use `font-variant-numeric: tabular-nums` for any numeric displays (unix timestamps, byte counts, etc.) to prevent layout shift
- **Optical alignment**: When reducing padding, ensure icons and text still feel visually centered. Use `leading-none` or `leading-tight` on compact elements

**Color Polish for Dark Theme:**
- Add subtle `border-b border-border/50` between sidebar categories for visual separation without heavy borders
- Use `bg-muted/50` hover states instead of `bg-muted` for subtler interaction feedback
- Consider `backdrop-blur-sm` on the header if it overlaps scrolling content

**Micro-interactions:**
- Add `transition-colors duration-150` to sidebar items for smooth hover
- Use `group` on sidebar items to show a subtle indicator arrow on hover

</details>

**File: `client/src/components/ui/card.tsx`**
| Element | Current | Target |
|---------|---------|--------|
| CardHeader | `p-6` | `p-3` |
| CardContent | `p-6 pt-0` | `p-3 pt-0` |
| CardTitle | `text-2xl` | `text-base` |
| CardDescription | `text-sm` | `text-xs` |

**File: `client/src/components/ui/button.tsx`**
| Variant | Current | Target |
|---------|---------|--------|
| Default | `h-10 px-4 py-2` | `h-8 px-3 py-1.5` |
| SM | `h-9 px-3` | `h-7 px-2.5` |
| Icon | `h-10 w-10` | `h-8 w-8` |

**File: `client/src/components/ui/input.tsx`**
| Element | Current | Target |
|---------|---------|--------|
| Height | `h-10` | `h-8` |
| Padding | `px-3 py-2` | `px-2.5 py-1.5` |
| Font | `text-base md:text-sm` | `text-sm` |

**File: `client/src/components/ui/textarea.tsx`**
| Element | Current | Target |
|---------|---------|--------|
| Min height | `min-h-[80px]` | `min-h-[60px]` |
| Padding | `px-3 py-2` | `px-2.5 py-1.5` |
| Font | `text-base md:text-sm` | `text-sm` |

#### 1.2 Layout Changes

**File: `client/src/pages/main-layout.tsx`**
| Element | Current | Target |
|---------|---------|--------|
| Header height | `h-16` (64px) | `h-12` (48px) |
| Header title | `text-2xl` | `text-base font-semibold` |
| Header icon | `h-6 w-6` | `h-4 w-4` |
| Sidebar width (expanded) | `w-[280px]` | `w-56` (224px) |
| Sidebar category spacing | `space-y-6` | `space-y-3` |
| Sidebar category label | `text-xs uppercase mb-4` | `text-[10px] uppercase mb-1.5` |
| Sidebar item spacing | `space-y-1` | `space-y-0.5` |
| Sidebar item padding | `px-3 py-2` | `px-2 py-1` |
| Sidebar item font | `text-sm` | `text-xs` |
| Sidebar item icon | `h-4 w-4` | `h-3.5 w-3.5` |
| Main content padding | `p-6` | `p-4` |

#### 1.3 CSS/Textarea Changes

**File: `client/src/index.css`**
| Class | Current | Target |
|-------|---------|--------|
| `.tool-textarea` | `min-h-[200px]` | `min-h-[180px]` |
| `.tool-textarea-json` | `min-h-[400px]` | `min-h-[300px]` |
| Global font size | browser default (16px) | `14px` base |

---

### Phase 2: Fix Broken Tools (Security First)

#### 2.1 CRITICAL: Markdown Preview XSS Fix
**File:** `client/src/components/tools/markdown-preview.tsx`
- **Add dependency:** `marked` + `dompurify`
- **Remove:** Custom regex-based markdown parser (lines 20-93)
- **Replace:** Use `marked.parse()` for rendering, `DOMPurify.sanitize()` before setting innerHTML
- **Keep:** `dangerouslySetInnerHTML` with sanitized output
- **Test cases:** `<script>alert(1)</script>`, `<img onerror=alert(1)>`, nested lists, tables, code blocks, GFM

<details>
<summary>Research Insights: Markdown Security</summary>

**Industry Standard (from web research):**
- `marked` + `DOMPurify` is the recommended combination. The `safe-marked` library combines both.
- **Critical**: Call `DOMPurify.sanitize(marked.parse(input))` - sanitize AFTER parsing, not before
- Configure DOMPurify to strip `javascript:` URLs: `DOMPurify.sanitize(html, { FORBID_ATTR: ['onerror', 'onload'], FORBID_TAGS: ['script', 'style'] })`
- Consider `react-markdown` as an alternative that avoids `dangerouslySetInnerHTML` entirely - it converts markdown tokens to React elements, so React's JSX escaping handles security. However, `marked` + `DOMPurify` is lighter and more flexible for this use case.

**Implementation Pattern:**
```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for GFM
marked.setOptions({ gfm: true, breaks: true });

const renderMarkdown = (input: string): string => {
  const rawHtml = marked.parse(input) as string;
  return DOMPurify.sanitize(rawHtml);
};
```

**Edge Cases:**
- Test with `[click me](javascript:alert(1))` - DOMPurify strips this
- Test with `<details><summary>click</summary><img src=x onerror=alert(1)></details>`
- Test with `![alt](https://evil.com/tracking.gif)` - images should render but track

**References:**
- [Marked Documentation](https://marked.js.org/)
- [safe-marked](https://github.com/azu/safe-marked)
- [React Markdown Security Guide](https://strapi.io/blog/react-markdown-complete-guide-security-styling)

</details>

#### 2.2 CRITICAL: HTML Preview Sandbox Fix
**File:** `client/src/components/tools/html-preview.tsx`
- **Change:** `sandbox="allow-same-origin"` -> `sandbox="allow-scripts"`
- **Rationale:** `allow-scripts` without `allow-same-origin` lets CSS/JS run but prevents parent access
- **Test:** Verify CSS rendering, JS execution, confirm `parent.localStorage` is blocked

<details>
<summary>Research Insights: Iframe Sandbox Security</summary>

**Security Analysis:**
- `sandbox="allow-same-origin"` is DANGEROUS - it gives the iframe full access to parent page's origin (localStorage, cookies, DOM manipulation)
- `sandbox="allow-scripts"` without `allow-same-origin` is the correct configuration: scripts run but cannot access parent
- **NEVER combine** `allow-scripts` AND `allow-same-origin` - this defeats the entire sandbox
- Use `srcdoc` attribute instead of blob URLs for cleaner rendering: `<iframe srcdoc={htmlContent} sandbox="allow-scripts" />`

**Additional Hardening:**
- Add `sandbox="allow-scripts allow-modals"` if you want `alert()`/`confirm()` to work in preview
- Consider CSP header on the iframe: `<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'">`
- Font loading may break without `allow-same-origin` - use `<link>` tags with absolute CDN URLs in the previewed HTML

</details>

#### 2.3 Code Beautifier - Use js-beautify (NOT Prettier)
**File:** `client/src/components/tools/code-beautifier.tsx`

> **CHANGED FROM ORIGINAL PLAN**: Prettier standalone is ~900KB with just the babel parser. js-beautify is only ~40KB total and supports JS, HTML, CSS. Use js-beautify instead.

- **Add dependency:** `js-beautify` (~40KB total, 22x smaller than Prettier standalone)
- **Remove:** All hand-rolled regex formatters
- **Replace with:** `js_beautify()` for JS, `html_beautify()` for HTML, `css_beautify()` for CSS
- **For JSON:** Keep using `JSON.stringify(JSON.parse(input), null, 2)` - it's perfect for JSON
- **Lazy load:** `const { js_beautify, html_beautify, css_beautify } = await import('js-beautify')`
- **Test cases:** Complex nested JS, CSS with media queries, malformed HTML

<details>
<summary>Research Insights: Code Formatting Bundle Size</summary>

**Bundle Size Comparison (from web research):**
| Library | Bundle Size | Languages |
|---------|-------------|-----------|
| Prettier standalone + babel | ~900KB | JS, TS, HTML, CSS, JSON, MD |
| Prettier standalone + all parsers | ~5.5MB | Everything |
| js-beautify | ~40KB | JS, HTML, CSS |
| JSON.stringify | 0KB (built-in) | JSON |

**Recommendation:** Use `js-beautify` for JS/HTML/CSS formatting and `JSON.stringify` for JSON. This covers all the Code Beautifier's language modes at 1/22 the cost.

**js-beautify Browser Usage:**
```typescript
// Lazy load on first use
const beautify = async (code: string, language: string) => {
  const { js_beautify, html_beautify, css_beautify } = await import('js-beautify');

  switch (language) {
    case 'javascript': return js_beautify(code, { indent_size: 2 });
    case 'html': return html_beautify(code, { indent_size: 2, wrap_line_length: 80 });
    case 'css': return css_beautify(code, { indent_size: 2 });
    case 'json': return JSON.stringify(JSON.parse(code), null, 2);
    default: return code;
  }
};
```

**References:**
- [js-beautify vs prettier comparison](https://npmtrends.com/js-beautify-vs-prettier)
- [Prettier browser docs](https://prettier.io/docs/browser)

</details>

#### 2.4 Certificate Decoder - Use @peculiar/x509
**File:** `client/src/components/tools/certificate-decoder.tsx`
- **Add dependency:** `@peculiar/x509`
- **Remove:** Mock data generation (lines 59-117)
- **Replace:** Parse PEM -> extract Subject, Issuer, Serial, Validity, SANs, Public Key info, Extensions
- **Lazy load:** Dynamic import on tool use
- **Test cases:** Self-signed cert, Let's Encrypt cert, expired cert, invalid PEM

<details>
<summary>Research Insights: X.509 Parsing</summary>

**Library Choice:**
- `@peculiar/x509` is the most maintained browser-compatible X.509 library (TypeScript, based on `@peculiar/asn1-schema`)
- Supports: certificate parsing, chain validation, CSR parsing
- ~150KB but lazy-loaded so only impacts Certificate Decoder users

**Implementation Pattern:**
```typescript
const decodeCertificate = async (pem: string) => {
  const { X509Certificate } = await import('@peculiar/x509');

  const cert = new X509Certificate(pem);
  return {
    subject: cert.subject,
    issuer: cert.issuer,
    serialNumber: cert.serialNumber,
    notBefore: cert.notBefore,
    notAfter: cert.notAfter,
    publicKey: {
      algorithm: cert.publicKey.algorithm,
    },
    extensions: cert.extensions.map(ext => ({
      type: ext.type,
      critical: ext.critical,
    })),
    // SANs
    subjectAlternativeNames: cert.getExtension('2.5.29.17'),
  };
};
```

**Edge Cases:**
- Handle DER-encoded certs (not just PEM)
- Handle certificate chains (multiple certs in one PEM)
- Show expiry status (expired/valid/expiring soon)
- Gracefully handle invalid/corrupted PEM input

</details>

#### 2.5 SQL Formatter - Use sql-formatter library
**File:** `client/src/components/tools/sql-formatter.tsx`
- **Add dependency:** `sql-formatter`
- **Remove:** Regex-based formatter (lines 28-43)
- **Replace:** `format(sql, { language: 'sql', tabWidth: 2 })`
- **Support dialects:** Standard SQL, MySQL, PostgreSQL
- **Test cases:** CTEs, subqueries, CASE statements, string literals with SQL keywords

<details>
<summary>Research Insights: SQL Formatting</summary>

**Implementation Pattern:**
```typescript
import { format } from 'sql-formatter';

const formatSQL = (sql: string, dialect: string = 'sql') => {
  return format(sql, {
    language: dialect, // 'sql' | 'mysql' | 'postgresql' | 'tsql'
    tabWidth: 2,
    keywordCase: 'upper',
    linesBetweenQueries: 2,
  });
};
```

**UI Enhancement:** Add a dialect dropdown (SQL, MySQL, PostgreSQL, T-SQL) so users can pick their database.

</details>

#### 2.6 PHP JSON Converter - Proper Parser
**File:** `client/src/components/tools/php-json-converter.tsx`
- **Rewrite:** PHP array parser using a recursive descent parser (simpler than full state machine)
- **Support:** `array()` syntax, `[]` short syntax, string/int/float/bool/null values, nested arrays, associative arrays
- **JSON to PHP:** Reverse conversion with proper formatting
- **Test cases:** Nested arrays, mixed keys, PHP constants, strings with quotes

<details>
<summary>Research Insights: PHP Array Parsing</summary>

**Simplicity Review:** A full state machine is over-engineered. A recursive descent parser is cleaner:

```typescript
// Tokenize first, then parse tokens recursively
type Token = { type: 'string' | 'number' | 'bool' | 'null' | 'arrow' | 'comma' | 'open' | 'close' | 'array'; value: string };

const tokenize = (input: string): Token[] => { /* scan characters */ };
const parseValue = (tokens: Token[], pos: number): [any, number] => {
  const token = tokens[pos];
  if (token.type === 'open' || token.type === 'array') return parseArray(tokens, pos);
  if (token.type === 'string') return [token.value, pos + 1];
  if (token.type === 'number') return [Number(token.value), pos + 1];
  if (token.type === 'bool') return [token.value === 'true', pos + 1];
  if (token.type === 'null') return [null, pos + 1];
  throw new Error(`Unexpected token: ${token.type}`);
};
```

**Key edge cases:**
- PHP single-quoted strings (`'hello'`) vs double-quoted (`"hello"`)
- PHP heredoc/nowdoc strings (skip - too complex, document as unsupported)
- PHP constants: `TRUE`, `FALSE`, `NULL` (case-insensitive)
- Nested `array()` and `[]` mixed syntax
- Trailing commas (valid in PHP)

</details>

#### 2.7 cURL to Code - Improved Custom Parser

> **CHANGED FROM ORIGINAL PLAN**: `curlconverter` requires tree-sitter WASM files served from the web root, which complicates deployment on GitHub Pages. Instead, write a better custom parser that handles common flags from Chrome/Firefox "Copy as cURL".

**File:** `client/src/components/tools/curl-to-code.tsx`
- **Rewrite:** Custom parser that handles the most common cURL flags
- **Support flags:** `-X`, `-H`, `-d`/`--data`/`--data-raw`, `-u`, `-b`, `-L`, `--compressed`, `-F`, multiline with `\`
- **Output languages:** JavaScript (fetch), Python (requests), Node.js (axios), Go, PHP
- **Test cases:** Chrome "Copy as cURL" output, multiline commands, auth headers, POST with JSON body

<details>
<summary>Research Insights: cURL Parsing</summary>

**Why not curlconverter:**
- Requires `tree-sitter.wasm` and `tree-sitter-bash.wasm` served from root directory
- GitHub Pages deployment with base path `/handy-dev-tools/` complicates WASM file serving
- Heavy dependency for what's fundamentally a string parsing task

**Better approach:** Write a proper tokenizer that handles shell quoting rules:
1. **Tokenize:** Split on whitespace, respecting single/double quotes and backslash escapes
2. **Parse flags:** Map tokens to a structured request object `{ method, url, headers, data, auth }`
3. **Generate code:** Template each language from the structured object

**Chrome "Copy as cURL" format:**
```
curl 'https://example.com/api' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  --data-raw '{"key":"value"}'
```

This is predictable and doesn't need a full shell parser - just proper quote handling.

</details>

#### 2.8 HTML to JSX Converter - Complete Conversion
**File:** `client/src/lib/utils/advanced-converters.ts` (lines 217-252)
- **Add:** All DOM event handler conversions (onclick->onClick, etc.)
- **Add:** Inline style string to object conversion (`style="color: red"` -> `style={{color: 'red'}}`)
- **Add:** Boolean attribute conversion (`disabled` -> `disabled={true}`)
- **Add:** Self-closing tag fixes (`<br>` -> `<br />`, `<img ...>` -> `<img ... />`)
- **Add:** `class` -> `className`, `for` -> `htmlFor` (ensure these work)
- **Test cases:** Full HTML page snippet, form with event handlers, inline styles

<details>
<summary>Research Insights: HTML to JSX Conversion</summary>

**Complete event handler map (most common):**
```typescript
const eventHandlerMap: Record<string, string> = {
  onclick: 'onClick', onchange: 'onChange', onsubmit: 'onSubmit',
  onkeydown: 'onKeyDown', onkeyup: 'onKeyUp', onkeypress: 'onKeyPress',
  onfocus: 'onFocus', onblur: 'onBlur', oninput: 'onInput',
  onmouseover: 'onMouseOver', onmouseout: 'onMouseOut',
  onmousedown: 'onMouseDown', onmouseup: 'onMouseUp',
  ondblclick: 'onDoubleClick', onscroll: 'onScroll',
  onload: 'onLoad', onerror: 'onError',
};
```

**Style string to object conversion:**
```typescript
const styleStringToObject = (style: string): string => {
  const pairs = style.split(';').filter(Boolean).map(pair => {
    const [prop, ...valueParts] = pair.split(':');
    const camelProp = prop.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const value = valueParts.join(':').trim();
    // Keep numeric values as numbers when possible
    const numValue = parseFloat(value);
    const isNumeric = !isNaN(numValue) && String(numValue) === value;
    return `${camelProp}: ${isNumeric ? numValue : `'${value}'`}`;
  });
  return `{{ ${pairs.join(', ')} }}`;
};
```

**Self-closing tags (void elements):**
```typescript
const voidElements = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);
```

</details>

#### 2.9 PHP Serializer - Fix Multibyte
**File:** `client/src/components/tools/php-serializer.tsx`
- **Fix line 69:** Use `new TextEncoder().encode(str).length` for byte length
- **Fix unserialize:** Handle byte-length-based string reading for multibyte
- **Test cases:** Strings with emojis, CJK characters, accented letters

<details>
<summary>Research Insights: PHP Serialization</summary>

**The core bug:** PHP's `serialize()` uses **byte length**, not character length:
```php
serialize("hello") → s:5:"hello";     // 5 bytes = 5 chars ✓
serialize("café")  → s:5:"café";      // 5 bytes (UTF-8: c=1,a=1,f=1,é=2) = 4 chars ✗
serialize("🎉")   → s:4:"🎉";        // 4 bytes (UTF-8) = 1 char ✗
```

**Fix:**
```typescript
// BEFORE (broken):
`s:${str.length}:"${str}";`

// AFTER (correct):
`s:${new TextEncoder().encode(str).length}:"${str}";`
```

**Unserialize fix:** When reading a string of N bytes, use `TextEncoder`/`TextDecoder` to count bytes, not characters.

</details>

#### 2.10 SVG to CSS Converter - Fix btoa
**File:** `client/src/components/tools/svg-css-converter.tsx`
- **Fix base64 mode:** Use `btoa(unescape(encodeURIComponent(svg)))` for UTF-8 safety
- **Improve clip-path:** Support circles, rects in addition to paths
- **Test cases:** SVG with non-ASCII text, multi-path SVGs, SVG with viewBox

#### 2.11 JSON to Code - Nested Type Generation
**File:** `client/src/components/tools/json-to-code.tsx`
- **Rewrite type inference:** Generate nested interfaces/classes for nested objects
- **Add:** Optional field detection (null values), array element type union
- **Support:** TypeScript interfaces, Python dataclasses, Go structs, Java classes
- **Test cases:** Deeply nested API response JSON, arrays of mixed types

<details>
<summary>Research Insights: Type Generation from JSON</summary>

**Recursive interface generation:**
```typescript
const generateInterfaces = (json: any, name: string = 'Root'): string[] => {
  const interfaces: string[] = [];
  const fields: string[] = [];

  for (const [key, value] of Object.entries(json)) {
    if (value === null) {
      fields.push(`  ${key}: unknown;`);
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object') {
        const itemName = pascalCase(key.replace(/s$/, '')); // "users" -> "User"
        interfaces.push(...generateInterfaces(value[0], itemName));
        fields.push(`  ${key}: ${itemName}[];`);
      } else {
        fields.push(`  ${key}: ${typeof value[0]}[];`);
      }
    } else if (typeof value === 'object') {
      const nestedName = pascalCase(key);
      interfaces.push(...generateInterfaces(value, nestedName));
      fields.push(`  ${key}: ${nestedName};`);
    } else {
      fields.push(`  ${key}: ${typeof value};`);
    }
  }

  interfaces.push(`interface ${name} {\n${fields.join('\n')}\n}`);
  return interfaces;
};
```

**Key improvements over current:**
- Nested objects generate separate named interfaces
- Arrays of objects generate typed arrays with extracted interfaces
- Pluralized array names get singularized for the item type
- `null` values become `unknown` (or `null` with optional marker)

</details>

---

### Phase 3: Dead Code Cleanup

- **Remove** `client/src/pages/home.tsx` (orphaned, never rendered)
- **Remove** `client/src/components/layout/sidebar.tsx` (standalone, unused - sidebar is inline in main-layout)
- **Remove** `client/src/components/layout/header.tsx` (standalone, unused - header is inline in main-layout)
- **Verify** no imports reference these files

---

## Dependencies to Add

| Package | Purpose | Approx Size | Lazy Load? |
|---------|---------|-------------|------------|
| `marked` | Markdown parsing | ~40KB | Yes |
| `dompurify` | HTML sanitization | ~15KB | Yes |
| `js-beautify` | Code formatting (JS/HTML/CSS) | ~40KB | Yes |
| `sql-formatter` | SQL formatting | ~50KB | Yes |
| `@peculiar/x509` | X.509 cert parsing | ~150KB | Yes |

**Total new dependencies:** ~295KB, all lazy-loaded per-tool

**Removed from plan:** `curlconverter` (WASM deployment complexity) - using improved custom parser instead

**Already in package.json (unused, can remove):** `prettier` - no longer needed since we're using js-beautify

<details>
<summary>Research Insights: Bundle Strategy</summary>

**Performance Recommendations:**
1. **React.lazy() for tool components:** Not just library lazy-loading - wrap each tool component in `React.lazy()` so only the active tool's code loads
2. **Vite manual chunks:** Configure `manualChunks` in `vite.config.ts` to separate tool-specific libraries
3. **Preload on hover:** When user hovers a sidebar item, preload that tool's chunk for instant rendering

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'markdown': ['marked', 'dompurify'],
        'sql': ['sql-formatter'],
        'x509': ['@peculiar/x509'],
        'beautify': ['js-beautify'],
      }
    }
  }
}
```

**Estimated bundle impact:**
- Initial bundle: ~0KB additional (all lazy-loaded)
- Per-tool first load: 40-150KB depending on tool
- Subsequent loads: cached by browser

</details>

---

## Acceptance Criteria

### UI
- [x] All font sizes reduced ~30% (titles text-xl, cards text-base, sidebar text-xs)
- [x] All padding/gaps reduced ~30% (cards p-3, grids gap-4, sidebar items py-1)
- [x] Header height 48px, sidebar width 224px
- [x] Visual comparison with DevUtils shows similar information density
- [x] Dark mode still works correctly
- [x] Mobile responsive layout preserved
- [x] Smooth hover transitions on sidebar items

### Broken Tools
- [x] Certificate Decoder parses real X.509 PEM certificates (Subject, Issuer, Serial, Validity, SANs)
- [x] Markdown Preview renders GFM correctly without XSS (tested with script injection)
- [x] HTML Preview sandbox prevents parent localStorage access
- [x] Code Beautifier formats JS, HTML, CSS correctly via js-beautify (~40KB)
- [x] SQL Formatter handles complex SQL with CTEs, subqueries, and dialect selection
- [x] PHP JSON Converter handles nested arrays, short syntax, PHP constants
- [x] cURL to Code parses Chrome "Copy as cURL" output correctly
- [x] HTML to JSX converts event handlers, inline styles to objects, boolean attrs, self-closing tags
- [x] PHP Serializer handles multibyte strings (emojis, CJK) with correct byte length
- [x] SVG to CSS handles non-ASCII SVGs without btoa crash
- [x] JSON to Code generates nested TypeScript interfaces from nested JSON

### Cleanup
- [x] Dead code removed (home.tsx, standalone sidebar/header)
- [x] No TypeScript errors
- [x] Build succeeds
- [ ] prettier dependency removed from package.json (replaced by js-beautify)

---

## Implementation Order

1. **UI compactness** (Phase 1) - Do this first so all subsequent tool fixes use the new layout
2. **Security fixes** (2.1 Markdown XSS, 2.2 HTML Preview sandbox)
3. **Library-backed fixes** (2.3 js-beautify, 2.4 Cert Decoder, 2.5 SQL Formatter)
4. **Custom code fixes** (2.6 PHP JSON, 2.7 cURL parser, 2.8 HTML to JSX)
5. **Small fixes** (2.9 PHP Serializer multibyte, 2.10 SVG btoa, 2.11 JSON to Code)
6. **Dead code cleanup** (Phase 3)

## References

- DevUtils competitor screenshot: Small 12-13px fonts, tight spacing, dark theme, dense sidebar
- [Marked Documentation](https://marked.js.org/)
- [safe-marked](https://github.com/azu/safe-marked) - marked + DOMPurify combined
- [js-beautify vs prettier](https://npmtrends.com/js-beautify-vs-prettier) - 40KB vs 900KB
- [Prettier browser docs](https://prettier.io/docs/browser) - standalone bundle size concerns
- [@peculiar/x509](https://github.com/PeculiarVentures/x509) - browser-compatible X.509 parser
- [curlconverter](https://github.com/curlconverter/curlconverter) - requires WASM, not suitable
- Current tool-layout.tsx: Lines 45-60 (spacing/grid)
- Current main-layout.tsx: Lines 1-435 (full layout)
- Current card.tsx: shadcn card with p-6 padding
