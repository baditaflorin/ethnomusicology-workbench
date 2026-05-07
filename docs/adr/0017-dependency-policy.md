# 0017 - Dependency Policy

## Status

Accepted

## Context

The platform touches research data and complex analysis.

## Decision

Prefer production-ready libraries with active maintenance. Keep heavyweight analysis engines lazy and replace custom logic with mature browser-safe packages when they are verified.

## Consequences

The default browser-native analyzer is deliberately small, deterministic, and covered by tests. Deep engine adapters can be added incrementally.

## Alternatives Considered

Using unmaintained native ports to satisfy a checklist was rejected because reliability matters more than name coverage.
