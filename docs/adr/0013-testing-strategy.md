# 0013 - Testing Strategy

## Status

Accepted

## Context

The app needs confidence in analysis, exports, and Pages deployment without GitHub Actions.

## Decision

Use Vitest for logic tests and Playwright for one static-site happy path. `make test` runs unit tests. `make smoke` builds, serves `docs/`, and runs Playwright against it.

## Consequences

Checks are local and hook-driven. Browser coverage focuses on critical workflows.

## Alternatives Considered

GitHub Actions were rejected by the bootstrap constraints.
