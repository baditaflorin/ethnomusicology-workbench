# 0009 - Configuration And Secrets Management

## Status

Accepted

## Context

Static sites cannot protect embedded secrets.

## Decision

No secrets are used in v1. Build metadata is non-secret. Optional public endpoints are unauthenticated. `.env.example` documents placeholders only.

## Consequences

Any future secret-backed feature must move to an offline generator or a runtime backend with a new ADR.

## Alternatives Considered

Encrypted or obfuscated frontend secrets were rejected because they are still exposed to users.
