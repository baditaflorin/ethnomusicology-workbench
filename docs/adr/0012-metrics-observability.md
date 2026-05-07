# 0012 - Metrics And Observability

## Status

Accepted

## Context

Mode A has no backend metrics endpoint.

## Decision

Ship no analytics in v1. The only external metadata fetch is the public GitHub latest commit request displayed in the UI.

## Consequences

No usage telemetry is collected. Product learning depends on voluntary user feedback and GitHub issues.

## Alternatives Considered

Plausible or a custom beacon was rejected for v1 to keep privacy simple.
