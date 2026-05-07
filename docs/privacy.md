# Privacy

Ethnomusicology Workbench is local-first.

## What stays local

- Imported field recordings.
- Audio features and annotations.
- Project state in IndexedDB/OPFS/localStorage.

## What leaves the browser

- The app fetches public repository metadata from https://api.github.com/repos/baditaflorin/ethnomusicology-workbench when showing the latest commit.
- The app opens external links only when the user clicks them.
- Optional WASM/model engines may download public model or runtime assets when the user starts them.

## Analytics

No analytics are included in v1.

## Exports

Exported ELAN, Praat TextGrid, MusicXML, LilyPond, CSV, and JSON files are generated locally and downloaded by the user.
