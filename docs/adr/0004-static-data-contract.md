# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no server-side data pipeline. User recordings are private and local.

## Decision

No public corpus is committed in v1. Static app assets live in `/docs`. Local project records are versioned objects in IndexedDB and export formats are generated on demand.

## Consequences

There is no freshness problem for public data. Breaking local schema changes need migration code.

## Alternatives Considered

Committing a sample corpus was rejected to avoid licensing and privacy ambiguity. The app instead generates synthetic demo recordings in-browser.
