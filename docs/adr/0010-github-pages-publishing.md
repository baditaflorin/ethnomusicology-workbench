# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live site must work from day one.

## Decision

Publish from `main` branch `/docs` directory. Vite builds into `docs/` with `emptyOutDir: false` so ADRs and project docs remain intact. The base path is `/ethnomusicology-workbench/`. A generated `404.html` mirrors `index.html` for SPA fallback.

## Consequences

The Pages artifact is committed. `docs/` must not be gitignored. Build scripts verify `docs/index.html` exists after each build.

## Alternatives Considered

`gh-pages` branch was rejected to keep local hook checks and published files visible in normal history. Publishing from repo root was rejected to avoid mixing source and generated assets.
