# 0003 - Frontend Framework And Build Tooling

## Status

Accepted

## Context

The UI has multiple coordinated views and needs strict TypeScript, static output, and lazy chunks.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, TanStack Query, zod, idb, lucide-react, Vitest, and Playwright.

## Consequences

The stack is familiar, production-grade, and compatible with GitHub Pages. Bundle splitting is handled by Vite dynamic imports.

## Alternatives Considered

Svelte and vanilla TypeScript were considered. React was chosen for ecosystem maturity and faster composition of complex panels.
