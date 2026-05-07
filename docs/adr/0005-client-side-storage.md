# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Researchers need local persistence without uploading sensitive recordings.

## Decision

Use IndexedDB through `idb` for recordings, analyses, annotations, and optional blobs. Use localStorage only for lightweight UI preferences.

## Consequences

Large files remain under browser quota controls. Users can export data for backup. Cross-device sync is not available in v1.

## Alternatives Considered

Server persistence was rejected for Mode A. OPFS-only storage was deferred because IndexedDB has wider ergonomic support.
