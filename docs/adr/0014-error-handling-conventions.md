# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Audio decoding, storage quotas, optional engines, and browser permissions can fail.

## Decision

Return typed results from analysis functions, validate external shapes with zod, and show user-facing errors through an error boundary or toast. Optional engines fail closed with clear recovery text.

## Consequences

Failures should not corrupt local project state or blank the app.

## Alternatives Considered

Throwing raw errors into the UI was rejected because it is poor research software ergonomics.
