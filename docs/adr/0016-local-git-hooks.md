# 0016 - Local Git Hooks

## Status

Accepted

## Context

No GitHub Actions are allowed, so local hooks must guard quality.

## Decision

Use plain `.githooks/` wired by `make install-hooks`.

## Consequences

Developers opt in locally, and hooks can be run manually through Make targets.

## Alternatives Considered

Lefthook was considered but plain hooks are sufficient for a single frontend project.
