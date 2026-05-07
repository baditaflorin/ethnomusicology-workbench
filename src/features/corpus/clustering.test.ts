import { describe, expect, it } from "vitest";
import { buildSimilarityEdges, clusterRecordings, cosineSimilarity } from "./clustering";
import type { Recording } from "@/types";

const recording = (id: string, vector: number[]): Recording =>
  ({
    id,
    name: id,
    source: "demo",
    createdAt: "2026-05-08T00:00:00.000Z",
    duration: 1,
    sampleRate: 22050,
    channels: 1,
    annotations: [],
    analysis: {
      schemaVersion: 1,
      engine: "test",
      generatedAt: "2026-05-08T00:00:00.000Z",
      duration: 1,
      sampleRate: 22050,
      channels: 1,
      rms: 0.1,
      peak: 0.2,
      zeroCrossingRate: 0.1,
      spectralCentroid: 400,
      onsetRate: 1,
      tempoEstimate: 60,
      pitchClassProfile: vector.slice(0, 12),
      keyMode: { tonic: "C", mode: "Ionian", confidence: 1, alternatives: [] },
      notes: [],
      timeline: [],
      similarityVector: vector,
      phonetics: { voicedRatio: 1, averagePitchHz: 440, pitchRangeHz: [440, 440] }
    }
  }) satisfies Recording;

describe("clustering", () => {
  it("computes cosine similarity", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it("groups similar recordings", () => {
    const corpus = [
      recording("a", [1, 0, 0]),
      recording("b", [0.98, 0.02, 0]),
      recording("c", [0, 1, 0])
    ];
    expect(buildSimilarityEdges(corpus, 0.9)).toHaveLength(1);
    expect(clusterRecordings(corpus, 0.9)).toHaveLength(2);
  });
});
