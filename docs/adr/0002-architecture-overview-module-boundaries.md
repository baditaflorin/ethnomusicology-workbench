# 0002 - Architecture Overview And Module Boundaries

## Status

Accepted

## Context

The app needs audio ingestion, analysis, annotations, statistics, clustering, graph visualization, and exports without a server.

## Decision

Use feature-oriented frontend modules:

- `features/audio`: decoding, feature extraction, transcription, scale and mode detection.
- `features/corpus`: similarity vectors, clustering, summaries.
- `features/annotations`: timeline editing and ELAN/Praat mapping.
- `features/exports`: MusicXML, LilyPond, CSV, JSON, EAF, TextGrid.
- `features/engines`: optional WebR, DuckDB-WASM, Whisper, and visualization adapters.
- `shared`: storage, UI primitives, validation, build metadata.

## Consequences

Boundaries stay explicit and testable. Optional engines do not block the initial bundle.

## Alternatives Considered

A single analysis module was rejected because it would couple unrelated workflows and make worker extraction harder later.
