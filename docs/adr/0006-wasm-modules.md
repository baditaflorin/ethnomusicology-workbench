# 0006 - WASM Modules Used

## Status

Accepted

## Context

The concept references librosa, Essentia, aubio, Music21, LilyPond, Verovio, DuckDB, Polars, Whisper, spaCy, Praat, WebR, and Cytoscape.js. Not every native stack component has a mature, small, browser-safe package.

## Decision

The v1 default engine is browser-native Web Audio analysis. Optional engines are lazy-loaded behind user action:

- DuckDB-WASM for SQL over corpus exports.
- WebR for local R statistical summaries.
- Cytoscape.js for corpus graph visualization.
- Browser/remote model adapter for local Whisper-style transcription experiments.
- Export adapters for ELAN EAF, Praat TextGrid, MusicXML, and LilyPond workflows.

## Consequences

Initial load stays small and the app works offline after install for core analysis. Deep engines can evolve independently.

## Alternatives Considered

Bundling every native-equivalent runtime in the initial payload was rejected because it would be slow, fragile on Pages, and hostile to mobile users.
