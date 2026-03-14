---
title: "feat: Convert to native Mac app with Tauri v2"
type: feat
date: 2026-03-14
---

# feat: Convert to native Mac app with Tauri v2

## Enhancement Summary

**Deepened on:** 2026-03-14
**Sections enhanced:** All 5 phases + architecture + acceptance criteria
**Review agents used:** security-sentinel, performance-oracle, architecture-strategist, kieran-typescript-reviewer, code-simplicity-reviewer, Context7 (Tauri v2 docs)

### Key Improvements from Review
1. **Simplified from 5 phases to 3** — Phases 1+2 merged (scaffolding + build config), Phases 3+4 merged (native integration + icons)
2. **Dropped `index-tauri.html`** — Use existing `index.html`; web-only scripts (GA, BMC) fail silently offline. No second file to maintain.
3. **Dropped `tauri-plugin-opener`** — `window.open()` works in Tauri v2's WKWebView by default. Test first, add plugin only if needed.
4. **Lazy-load all 37 tools** — Current eager loading parses ~1.5 MB JS on startup. `React.lazy()` cuts initial parse to ~300 KB.
5. **Centralized platform detection** — Single `client/src/lib/platform.ts` instead of scattered `'__TAURI_INTERNALS__' in window` checks.
6. **Fixed double-router bug** — Remove vestigial hash router from `main.tsx` before adding Tauri conditionals.
7. **Tightened CSP** — Removed `unsafe-eval` and `unsafe-inline` from `script-src`, added `object-src 'none'`.
8. **Build target `safari16`** — Not `safari13`. Catalina (10.15) is EOL; targeting safari16 produces smaller, faster output.

### Security Findings (from security-sentinel)
- Fix XSS in regex-tester.tsx (`dangerouslySetInnerHTML` without HTML escaping)
- Fix XSS in json-formatter.tsx (`highlightJSON` missing HTML escaping)
- Don't persist JWT input to localStorage (bearer tokens)
- Start with strict CSP, loosen only if testing fails

### Performance Findings (from performance-oracle)
- All 36 tools eagerly loaded = 1.55 MB JS to parse on cold start
- `@peculiar/x509` alone is 207 KB (certificate decoder — rarely used)
- Debounce localStorage writes in `useToolState` (fires on every keystroke)
- Memoize `allFilteredTools` in `main-layout.tsx` (recalculated on every render)

---

## Overview

Wrap the existing Handy Dev Tools static React site into a native macOS application using Tauri v2. The app contains 37 developer utility tools that run 100% client-side with zero backend dependencies. Tauri v2 provides a lightweight native shell (~5MB binary vs ~150MB Electron) using macOS's built-in WKWebView, resulting in faster startup, lower memory usage, and a more native Mac experience.

## Problem Statement / Motivation

The tools are currently only accessible via a web browser at `shivasaxena.com/handy-dev-tools/`. A native Mac app provides:
- **Instant access** via Spotlight/Dock without opening a browser
- **Offline availability** — all tools work without internet
- **Native feel** — proper window management, Cmd+Q to quit, menu bar integration
- **Better clipboard/file integration** — native save dialogs, system clipboard
- **No browser overhead** — faster startup, lower memory, no tab clutter

## Technical Approach

### Architecture

```
handy-dev-tools/
├── client/                    # Existing React frontend (Vite root)
│   ├── src/
│   │   ├── lib/
│   │   │   └── platform.ts   # NEW: Centralized isTauri detection
│   │   ├── App.tsx            # MODIFY: Conditional basePath
│   │   └── main.tsx           # MODIFY: Remove hash router wrapper
│   └── index.html             # UNCHANGED: Works for both web and Tauri
├── src-tauri/                 # NEW: Tauri backend
│   ├── src/
│   │   ├── main.rs            # macOS entry point (auto-generated)
│   │   └── lib.rs             # Tauri setup (Edit menu)
│   ├── capabilities/
│   │   └── default.json       # Permissions (core only)
│   ├── icons/                 # App icons (generated via `tauri icon`)
│   ├── tauri.conf.json        # Tauri configuration
│   ├── Cargo.toml             # Rust dependencies
│   └── build.rs               # Build script (auto-generated)
├── dist/public/               # Vite build output (Tauri's frontendDist)
├── vite.config.ts             # MODIFY: Conditional base path + Tauri settings
└── package.json               # MODIFY: Add Tauri deps and scripts
```

### Key Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Entry HTML | Single `index.html` for both targets | Web-only scripts (GA, BMC) fail silently when offline in Tauri. No second file to drift out of sync. |
| Platform detection (build-time) | `process.env.TAURI_ENV_PLATFORM` in `vite.config.ts` | Official Tauri env var, set automatically by `tauri dev`/`tauri build` |
| Platform detection (runtime) | Centralized `isTauri` in `platform.ts` | DRY; single place to update if Tauri changes detection API |
| External URL opening | `window.open()` (no plugin) | Works by default in Tauri v2 WKWebView. Add plugin later only if testing reveals issues. |
| Tool loading | `React.lazy()` per tool | Cuts initial parse from ~1.5 MB to ~300 KB. Disk-local loading is imperceptible (<10ms). |
| Router | Remove hash router from `main.tsx`, keep custom hook in `App.tsx` | The double-router is a pre-existing bug. The hash router in `main.tsx` is dead code. |

### Implementation Phases

#### Phase 1: Setup & Working Dev Build

**Goal:** Get `npm run dev:tauri` showing the existing app with HMR.

**Pre-requisite: Fix double-router bug (preparatory commit)**
- [ ] Remove `useHashLocation` import and `<Router>` wrapper from `main.tsx`
- [ ] Simplify `main.tsx` to just `createRoot(document.getElementById("root")!).render(<App />);`
- [ ] Verify web version still works at `localhost:5173` with History API routing

**Scaffolding:**
- [ ] Verify Rust toolchain: `rustc --version && cargo --version` (install via `curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh` if missing)
- [ ] Verify Xcode Command Line Tools: `xcode-select -p` (install via `xcode-select --install` if missing)
- [ ] Install Tauri CLI: `npm install -D @tauri-apps/cli@latest`
- [ ] Install Tauri API: `npm install @tauri-apps/api@latest`
- [ ] Run `npx tauri init` with these settings:
  - App name: `Handy Dev Tools`
  - Window title: `Handy Dev Tools`
  - Frontend dist: `../dist/public`
  - Dev URL: `http://localhost:5173`
  - Dev command: `npm run dev:vite`
  - Build command: `npm run build:vite`
- [ ] Add to `.gitignore`: `src-tauri/target/`
- [ ] Add to `tsconfig.json` exclude: `"src-tauri"`

**npm scripts:**
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "dev:vite": "vite --config vite.config.ts",
    "dev:tauri": "tauri dev",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "build:vite": "vite build",
    "build:tauri": "tauri build",
    "tauri": "tauri"
  }
}
```

> **Note:** Keep existing `dev` and `build` scripts unchanged for web. Add `dev:vite` (pure Vite, no Express) for Tauri's `beforeDevCommand`. Add `build:vite` (Vite only, no server bundle) for Tauri's `beforeBuildCommand`.

**Create `client/src/lib/platform.ts`:**
```typescript
declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export const isTauri = typeof window !== 'undefined'
  && '__TAURI_INTERNALS__' in window;
```

**Update `vite.config.ts`:**
```typescript
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM;
const isDebug = !!process.env.TAURI_ENV_DEBUG;

export default defineConfig({
  base: isTauriBuild ? '/' : '/handy-dev-tools/',
  plugins: [
    react(),
    // Exclude Replit plugins entirely for Tauri builds
    ...(!isTauriBuild && process.env.NODE_ENV !== 'production' && process.env.REPL_ID
      ? [runtimeErrorOverlay(), cartographer()]
      : []),
  ],
  build: {
    target: isTauriBuild ? 'safari16' : 'modules',
    minify: isDebug ? false : 'esbuild',
    sourcemap: isDebug,
    // ... keep existing outDir, emptyOutDir, rollupOptions, chunkSizeWarningLimit
  },
  server: {
    port: 5173,
    strictPort: true,
    host: process.env.TAURI_DEV_HOST || false,
    watch: { ignored: ['**/src-tauri/**'] },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  // ... keep existing resolve.alias, root
});
```

**Update `App.tsx`:**
```typescript
import { isTauri } from '@/lib/platform';

const basePath = isTauri ? '' : '/handy-dev-tools';
// rest of useLocationHook unchanged — it already strips basePath
```

**Verify:** `npm run dev:tauri` opens a native window showing the app with working navigation.

**Files:**
- `client/src/main.tsx` (modify — remove hash router)
- `client/src/lib/platform.ts` (new — centralized detection)
- `client/src/App.tsx` (modify — conditional basePath)
- `vite.config.ts` (modify — Tauri conditionals)
- `package.json` (modify — add deps and scripts)
- `src-tauri/*` (new — auto-generated by `tauri init`)
- `.gitignore` (modify — add `src-tauri/target/`)

#### Phase 2: Native Integration, Icons & Config

**Goal:** Make the app feel like a proper Mac citizen with working keyboard shortcuts.

**macOS Edit menu (CRITICAL):**

Without this, Cmd+C/V/X/A/Z won't work in any text field, making the app useless as a dev tool.

Update `src-tauri/src/lib.rs`:
```rust
use tauri::menu::{MenuBuilder, SubmenuBuilder};

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let edit_menu = SubmenuBuilder::new(app, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()?;
            let menu = MenuBuilder::new(app)
                .item(&edit_menu)
                .build()?;
            app.set_menu(menu)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

> **Context7 verified:** Tauri v2 uses `MenuBuilder` and `SubmenuBuilder` from `tauri::menu`. The `.undo()`, `.copy()`, etc. are predefined menu item builders that automatically wire up to the correct macOS accelerators.

**Window configuration in `tauri.conf.json`:**
```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Handy Dev Tools",
  "version": "1.0.0",
  "identifier": "com.shivasaxena.handydevtools",
  "build": {
    "beforeDevCommand": "npm run dev:vite",
    "beforeBuildCommand": "npm run build:vite",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist/public"
  },
  "app": {
    "title": "Handy Dev Tools",
    "windows": [
      {
        "title": "Handy Dev Tools",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": {
        "default-src": "'self'",
        "script-src": "'self'",
        "style-src": "'self' 'unsafe-inline'",
        "img-src": "'self' data: blob:",
        "media-src": "'self' blob:",
        "connect-src": "'self'",
        "frame-src": "'self' blob:",
        "object-src": "'none'"
      }
    }
  },
  "bundle": {
    "active": true,
    "targets": ["dmg", "app"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "macOS": {
      "minimumSystemVersion": "10.15"
    }
  }
}
```

### CSP Research Insights

**Starting strict, loosen only if testing fails:**
- No `unsafe-eval` — audit found no `eval()` or `new Function()` usage in the codebase
- No `unsafe-inline` for `script-src` — Vite bundles all JS, no inline scripts needed
- `unsafe-inline` for `style-src` only — required by Tailwind/shadcn runtime styles
- `object-src 'none'` — explicitly block plugins (best practice)
- `frame-src 'self' blob:` — supports HTML Preview iframe with `srcdoc`. Dropped `data:` as no tool uses data: URI iframes.
- If the HTML Preview iframe breaks, add `'unsafe-inline'` to `script-src` and document the specific reason

**Tauri auto-injects:** Tauri v2 automatically merges `ipc: http://ipc.localhost` into `connect-src` for its IPC bridge. No manual configuration needed.

**Capabilities — minimal:**
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for Handy Dev Tools",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:default"
  ]
}
```

> No `opener:default` needed. `window.open()` to external URLs works by default in Tauri v2's WKWebView — it opens in the system browser. Test first during Phase 3.

**App icon:**
- [ ] Convert existing `favicon.svg` to 1024x1024 PNG: `npx @aspect-build/rules_js//js/private:js_binary -- convert favicon.svg icon-1024.png` or use any SVG-to-PNG converter
- [ ] Generate all sizes: `npx tauri icon ./icon-1024.png`
- [ ] Verify icons appear in `src-tauri/icons/`

**Files:**
- `src-tauri/src/lib.rs` (modify — Edit menu)
- `src-tauri/tauri.conf.json` (modify — full config)
- `src-tauri/capabilities/default.json` (modify — permissions)
- `src-tauri/icons/*` (new — generated)

#### Phase 3: Performance, Build & Verification

**Goal:** Lazy-load tools, produce a working `.dmg`, and verify everything works.

**Lazy-load all tool components (CRITICAL for cold start):**

Update `client/src/pages/tool.tsx` — replace all static imports with `React.lazy()`:

```typescript
import React, { Suspense } from 'react';

// Instead of:
// import JsonFormatter from "@/components/tools/json-formatter";
// import Base64String from "@/components/tools/base64-string";
// ... 35 more imports

const JsonFormatter = React.lazy(() => import("@/components/tools/json-formatter"));
const Base64String = React.lazy(() => import("@/components/tools/base64-string"));
// ... all other tools

// In the render:
export default function Tool({ toolId }: { toolId: string }) {
  const ToolComponent = toolMap[toolId];
  if (!ToolComponent) return <NotFound />;
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading tool...</div>}>
      <ToolComponent />
    </Suspense>
  );
}
```

> **Performance impact:** Cuts initial JS parse from ~1.55 MB to ~300 KB. Each tool loads on demand. From local filesystem in Tauri, lazy-load latency is <10ms (imperceptible).

**Additional performance wins:**
- [ ] Debounce localStorage writes in `useToolState` hook (300ms) — currently fires on every keystroke
- [ ] Memoize `allFilteredTools` and `filteredCategories` in `main-layout.tsx` with `useMemo`

**Build:**
- [ ] Run `npm run build:tauri` (or `npx tauri build --bundles dmg`)
- [ ] Verify DMG created at `src-tauri/target/release/bundle/dmg/`
- [ ] Install from DMG → test launch

**Test all critical tools:**
- [ ] JSON Formatter — paste, format, copy output
- [ ] Base64 Encode/Decode — encode text, decode text
- [ ] JWT Debugger — paste a JWT, verify decode
- [ ] HTML Preview — enter HTML with `<script>`, verify it executes in iframe
- [ ] QR Code — generate QR, download PNG, upload image to decode
- [ ] Hash Generator — generate MD5/SHA hashes
- [ ] Color Converter — convert hex to RGB
- [ ] Regex Tester — verify highlighting works
- [ ] Certificate Decoder — paste a PEM cert, verify decode

**Test Mac integration:**
- [ ] Cmd+C/V/X/A/Z work in text inputs (Edit menu)
- [ ] Cmd+Q quits the app
- [ ] Cmd+W closes the window
- [ ] Cmd+K opens tool search (existing keyboard shortcut)
- [ ] Feedback button opens GitHub in system browser (via `window.open`)
- [ ] Window resizing works, sidebar collapses properly
- [ ] App icon appears correctly in Dock and Cmd+Tab
- [ ] localStorage persists between app restarts
- [ ] Click dock icon when app running but window closed → reopens window

**Test offline behavior:**
- [ ] Disconnect from internet, launch app
- [ ] All tools work without network
- [ ] No error dialogs or console errors from failed external requests
- [ ] GA/BMC scripts fail silently (no user-visible errors)

**CSP troubleshooting (if tools break):**
- If HTML Preview iframe doesn't work → add `'unsafe-inline'` to `script-src`
- If styles break → verify `'unsafe-inline'` is in `style-src`
- If blob downloads fail → verify `blob:` is in relevant directive
- Check DevTools Console for CSP violation messages

**If `window.open` doesn't work for Feedback button:**
- Install `@tauri-apps/plugin-opener` and `tauri-plugin-opener` (Rust)
- Add `opener:default` to capabilities
- Use dynamic import pattern:
```typescript
// client/src/lib/platform.ts
export async function openExternalUrl(url: string): Promise<void> {
  if (isTauri) {
    const { open } = await import('@tauri-apps/plugin-opener');
    await open(url);
  } else {
    window.open(url, '_blank');
  }
}
```

**Verify web build still works:**
- [ ] `npm run build` completes without errors
- [ ] Deploy to GitHub Pages and verify all tools work at `/handy-dev-tools/`

**Files:**
- `client/src/pages/tool.tsx` (modify — lazy loading)
- `client/src/hooks/use-tool-state.ts` (modify — debounce writes)
- `client/src/pages/main-layout.tsx` (modify — memoize filters)

## Acceptance Criteria

### Functional Requirements
- [ ] `npm run dev:tauri` launches a Tauri dev window with HMR showing the app
- [ ] `npm run build:tauri` produces a `.dmg` installer
- [ ] All 37 tools work identically in the Tauri app as they do in the browser
- [ ] Existing web deployment (`npm run build`) continues to work unchanged
- [ ] Cmd+C/V/X/A/Z work in all text input fields
- [ ] Feedback button opens GitHub Issues in the system browser
- [ ] HTML Preview tool works (iframe with user scripts)
- [ ] File downloads work (QR code PNG, decoded images)
- [ ] localStorage persists between app sessions
- [ ] App works fully offline

### Non-Functional Requirements
- [ ] App binary < 15MB (Tauri typical is 5-10MB)
- [ ] Cold start < 2 seconds (lazy loading should achieve <1s on Apple Silicon)
- [ ] No external network requests on launch (GA/BMC fail silently when offline)
- [ ] Minimum macOS version: 10.15 (Catalina)

### Security Requirements (from security-sentinel review)
- [ ] CSP does not include `unsafe-eval`
- [ ] Regex tester HTML-escapes matched text before `dangerouslySetInnerHTML`
- [ ] JSON formatter `highlightJSON` HTML-escapes input before syntax coloring
- [ ] JWT Debugger does NOT persist JWT input to localStorage

## Dependencies & Prerequisites

| Dependency | Purpose | Required? |
|---|---|---|
| Rust toolchain (`rustc`, `cargo`) | Compiles Tauri backend | Yes |
| Xcode Command Line Tools | macOS compilation | Yes |
| `@tauri-apps/cli` (dev) | Tauri CLI commands | Yes |
| `@tauri-apps/api` (runtime) | JS-Rust bridge | Yes |
| `@tauri-apps/plugin-opener` | Open URLs in system browser | Only if `window.open` fails |
| Apple Developer ID ($99/yr) | Code signing + notarization | No (deferred) |

## Risk Analysis & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| HTML Preview iframe blocked by CSP | 1 tool broken | Medium | Start strict, loosen `script-src` if needed |
| File downloads don't trigger save dialog | 2 tools broken | Low | Test first; add `tauri-plugin-dialog` as fallback |
| Cmd+C/V not working without Edit menu | All tools crippled | High | Add native Edit menu in Rust (Phase 2) |
| Base path misconfiguration | White screen | High | `TAURI_ENV_PLATFORM` detection + test both builds |
| Gatekeeper blocks unsigned app | Can't distribute publicly | Certain (without signing) | Document right-click workaround; sign before public release |
| `window.open` fails for external URLs | Feedback button broken | Low | Fallback to `tauri-plugin-opener` with dynamic import |
| XSS via `dangerouslySetInnerHTML` in regex/JSON tools | Tauri IPC access in desktop context | Low | HTML-escape before injection (fix in Phase 3) |

## Future Considerations

- **Code signing & notarization** — Required before public distribution. Apple Developer ID is $99/year. Without it, macOS Gatekeeper blocks the app with "developer cannot be verified."
- **Auto-updates** — `tauri-plugin-updater` for checking/installing updates from GitHub Releases. Requires code signing.
- **GitHub Actions CI** — Build DMG on push to `main`, upload to GitHub Releases.
- **Windows/Linux support** — Tauri supports all three platforms; would require testing and potentially different CSP/menu config.
- **Native file dialogs** — Replace blob download trick with `tauri-plugin-dialog` + `tauri-plugin-fs` for a more native save experience.
- **System tray** — Quick access to frequently used tools from the menu bar.
- **Deep linking** — `handydevtools://tool/json-formatter` protocol handler.
- **Remove dead server code** — The `server/` directory, `drizzle.config.ts`, and all Express/Passport/Drizzle dependencies are unused. Remove in a separate cleanup PR to avoid mixing concerns.

## References & Research

### Internal References
- Vite config: `vite.config.ts:10` (hardcoded base path)
- App routing: `client/src/App.tsx:19` (hardcoded basePath)
- Router bug: `client/src/main.tsx:9` (vestigial hash router wrapper)
- Tool eager loading: `client/src/pages/tool.tsx` (all 36 tools statically imported)
- Feedback button: `client/src/pages/main-layout.tsx:205` (window.open)
- HTML preview iframe: `client/src/components/tools/html-preview.tsx:138` (sandbox="allow-scripts")
- Regex XSS: `client/src/components/tools/regex-tester.tsx:65` (unescaped dangerouslySetInnerHTML)
- JSON XSS: `client/src/components/tools/json-formatter.tsx:327` (highlightJSON missing escape)
- Tool state persistence: `client/src/hooks/use-tool-state.ts` (localStorage on every keystroke)
- Filter recomputation: `client/src/pages/main-layout.tsx:139` (useEffect deps recalculate every render)

### External References
- [Tauri v2 — Create a Project](https://v2.tauri.app/start/create-project/)
- [Tauri v2 — Vite Frontend](https://v2.tauri.app/start/frontend/vite/)
- [Tauri v2 — Configuration Reference](https://v2.tauri.app/reference/config/)
- [Tauri v2 — Window Menu](https://v2.tauri.app/learn/window-menu/)
- [Tauri v2 — CSP Configuration](https://v2.tauri.app/security/csp/)
- [Tauri v2 — Capabilities](https://v2.tauri.app/security/capabilities/)
- [Tauri v2 — macOS DMG](https://v2.tauri.app/distribute/dmg/)
- [Tauri v2 — Prerequisites](https://v2.tauri.app/start/prerequisites/)
