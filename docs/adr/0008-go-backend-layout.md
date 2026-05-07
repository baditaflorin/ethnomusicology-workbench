# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

The bootstrap template describes Go layout for Mode B or Mode C.

## Decision

Skip Go backend layout in Mode A.

## Consequences

No `cmd/`, `internal/`, Dockerfile, migrations, or Go-specific hooks are required.

## Alternatives Considered

Adding an unused Go backend was rejected because it would create maintenance burden and imply a runtime surface that does not exist.
