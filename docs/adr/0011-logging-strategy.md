# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs.

## Decision

Use minimal browser logging in development. Production UI errors go through visible error boundaries and toasts instead of noisy console output.

## Consequences

Researchers see actionable failures. No user data is logged remotely.

## Alternatives Considered

Remote logging was rejected because it creates privacy and disclosure obligations for field recordings.
