# Data Contract

Mode A has no prebuilt public corpus and no server-side data pipeline.

## Local Project Schema

Browser storage keeps:

- `recordings`: user-imported metadata, analysis summaries, annotations, and optional local audio blobs.
- `settings`: UI preferences and engine choices.

## Export Formats

- ELAN `.eaf` XML for annotation interchange.
- Praat TextGrid for phonetics-oriented timeline interchange.
- MusicXML for notation tools.
- LilyPond `.ly` source for score engraving workflows.
- CSV and JSON for statistical analysis.

Schema changes must be versioned in the stored project state and documented in an ADR.
