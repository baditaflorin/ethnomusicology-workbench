import { describe, expect, it } from "vitest";
import { exportElanEaf, exportLilyPond, exportMusicXml, exportPraatTextGrid } from "./exporters";
import type { Recording } from "@/types";

const sampleRecording: Recording = {
  id: "rec-1",
  name: "Test Recording",
  source: "demo",
  createdAt: "2026-05-08T00:00:00.000Z",
  duration: 2,
  sampleRate: 22050,
  channels: 1,
  annotations: [
    {
      id: "ann-1",
      tier: "researcher",
      start: 0,
      end: 1,
      value: "opening motif",
      createdAt: "2026-05-08T00:00:00.000Z"
    }
  ],
  analysis: {
    schemaVersion: 1,
    engine: "test",
    generatedAt: "2026-05-08T00:00:00.000Z",
    duration: 2,
    sampleRate: 22050,
    channels: 1,
    rms: 0.1,
    peak: 0.2,
    zeroCrossingRate: 0.1,
    spectralCentroid: 500,
    onsetRate: 2,
    tempoEstimate: 120,
    pitchClassProfile: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    keyMode: { tonic: "C", mode: "Ionian", confidence: 0.9, alternatives: [] },
    notes: [
      {
        id: "n1",
        start: 0,
        end: 0.5,
        duration: 0.5,
        midi: 60,
        frequency: 261.63,
        name: "C",
        octave: 4,
        confidence: 0.8
      }
    ],
    timeline: [
      {
        id: "seg-1",
        start: 0,
        end: 0.5,
        label: "C4",
        kind: "note",
        confidence: 0.8
      }
    ],
    similarityVector: [1, 0, 0],
    phonetics: { voicedRatio: 1, averagePitchHz: 261.63, pitchRangeHz: [261.63, 261.63] }
  }
};

describe("exporters", () => {
  it("exports ELAN EAF", () => {
    expect(exportElanEaf(sampleRecording).content).toContain("<ANNOTATION_DOCUMENT");
  });

  it("exports Praat TextGrid", () => {
    expect(exportPraatTextGrid(sampleRecording).content).toContain('Object class = "TextGrid"');
  });

  it("exports score formats", () => {
    expect(exportMusicXml(sampleRecording).content).toContain("<score-partwise");
    expect(exportLilyPond(sampleRecording).content).toContain("\\score");
  });
});
