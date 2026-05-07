export type ModeName =
  | "Ionian"
  | "Dorian"
  | "Phrygian"
  | "Lydian"
  | "Mixolydian"
  | "Aeolian"
  | "Locrian";

export type KeyMode = {
  tonic: string;
  mode: ModeName;
  confidence: number;
  alternatives: Array<{
    tonic: string;
    mode: ModeName;
    score: number;
  }>;
};

export type TranscribedNote = {
  id: string;
  start: number;
  end: number;
  duration: number;
  midi: number;
  frequency: number;
  name: string;
  octave: number;
  confidence: number;
};

export type TimelineSegment = {
  id: string;
  start: number;
  end: number;
  label: string;
  kind: "note" | "silence" | "speech" | "texture";
  confidence: number;
};

export type Annotation = {
  id: string;
  tier: "researcher" | "phonetics" | "translation" | "performance" | "context";
  start: number;
  end: number;
  value: string;
  createdAt: string;
};

export type RecordingAnalysis = {
  schemaVersion: 1;
  engine: string;
  generatedAt: string;
  duration: number;
  sampleRate: number;
  channels: number;
  rms: number;
  peak: number;
  zeroCrossingRate: number;
  spectralCentroid: number;
  onsetRate: number;
  tempoEstimate: number;
  pitchClassProfile: number[];
  keyMode: KeyMode;
  notes: TranscribedNote[];
  timeline: TimelineSegment[];
  similarityVector: number[];
  phonetics: {
    voicedRatio: number;
    averagePitchHz: number;
    pitchRangeHz: [number, number];
  };
};

export type Recording = {
  id: string;
  name: string;
  source: "imported" | "demo";
  createdAt: string;
  duration: number;
  sampleRate: number;
  channels: number;
  analysis: RecordingAnalysis;
  annotations: Annotation[];
};

export type Cluster = {
  id: string;
  label: string;
  recordingIds: string[];
  centroid: number[];
};
