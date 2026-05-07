# Postmortem

## What Was Built

The project was implemented as a static GitHub Pages application with local audio import, in-browser acoustic analysis, melodic transcription, mode detection, annotation timelines, corpus clustering, statistics, exports, documentation, local hooks, and a Pages-ready build.

## Was Mode A Correct?

Yes for v1. The essential workflow works without authentication, secrets, shared state, or a runtime database. Browser APIs and lazy WASM-capable modules are enough for local-first analysis and export. A backend would add operational weight before there is a hard requirement.

## What Worked

- GitHub Pages could be enabled from the first commit.
- The app can keep sensitive recordings local.
- Export-first design gives researchers escape hatches into ELAN, Praat, LilyPond, MusicXML, CSV, and JSON.

## What Did Not

- Full parity with native Praat, Music21, librosa, Essentia, aubio, and Whisper is too large for a first static release.
- Browser model downloads can be heavy and device-dependent.

## Surprises

The static-first constraint sharpened the product: corpus analysis, clustering, and annotation are useful even before optional heavyweight engines are loaded.

## Accepted Tech Debt

- Some deep engines are represented by lazy adapters and interchange formats rather than bundled native-equivalent runtimes.
- Pitch detection uses a browser-native autocorrelation pipeline as the default engine.
- WebR and DuckDB are optional user-triggered engines.

## Next Improvements

1. Add a dedicated Web Worker pool for long recordings.
2. Add verified Essentia.js and aubio.js adapters behind the engine registry.
3. Add model selection and caching for local Whisper transcription.

## Time Spent Versus Estimate

The first implementation was scoped as a one-session v1. A department-scale replacement needs iterative validation with real field corpora and domain experts.
