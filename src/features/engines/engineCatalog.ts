export type EngineCatalogItem = {
  name: string;
  role: string;
  status: "ready" | "lazy" | "adapter" | "export";
  notes: string;
};

export const engineCatalog: EngineCatalogItem[] = [
  {
    name: "Web Audio",
    role: "Default acoustic analysis",
    status: "ready",
    notes: "Decoding, pitch tracking, feature extraction, and melodic transcription run locally."
  },
  {
    name: "Cytoscape.js",
    role: "Corpus graph",
    status: "lazy",
    notes: "Loaded only when the similarity graph is visible."
  },
  {
    name: "DuckDB-WASM",
    role: "Corpus SQL",
    status: "lazy",
    notes: "User-triggered in-browser SQL summary over generated corpus rows."
  },
  {
    name: "WebR",
    role: "Statistics",
    status: "lazy",
    notes: "User-triggered local R runtime for reproducible summaries."
  },
  {
    name: "Whisper",
    role: "Speech transcription",
    status: "adapter",
    notes: "Transformers.js adapter is lazy; model downloads are explicit user actions."
  },
  {
    name: "ELAN / Praat",
    role: "Annotation exchange",
    status: "export",
    notes: "Exports EAF and TextGrid timelines without uploading recordings."
  },
  {
    name: "MusicXML / LilyPond",
    role: "Score exchange",
    status: "export",
    notes: "Exports notation-friendly transcriptions for Verovio, LilyPond, and other score tools."
  },
  {
    name: "librosa / Essentia / aubio / Music21 / spaCy / Polars",
    role: "Deep engine roadmap",
    status: "adapter",
    notes:
      "V1 keeps browser-safe adapters and interchange points; verified WASM ports can replace fallbacks incrementally."
  }
];
