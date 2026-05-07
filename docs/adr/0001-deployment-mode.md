# 0001 - Deployment Mode

## Status

Accepted

## Context

The platform should default to GitHub Pages unless a runtime server is genuinely required. The v1 workflow imports local files, runs analysis locally, stores state locally, and exports artifacts.

## Decision

Use Mode A: Pure GitHub Pages.

The app is a static React/Vite build published from `main` branch `/docs`. Browser APIs, Web Workers, IndexedDB/OPFS, optional WASM runtimes, and user-triggered downloads cover v1.

## Consequences

- No backend, Docker, nginx, runtime API, runtime database, or server secrets.
- Heavy engines must be lazy-loaded and optional.
- Cross-device sync, multi-user collaboration, and managed processing are out of scope for v1.

## Alternatives Considered

- Mode B: rejected because v1 uses user-owned recordings, not a public precomputed corpus.
- Mode C: rejected because no runtime mutations, auth, secrets, or real-time server features are required.
