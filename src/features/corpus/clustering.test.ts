import { describe, expect, it } from "vitest";
import {
  buildSimilarityEdges,
  clusterRecordings,
  cosineSimilarity,
  DEFAULT_SIMILARITY_WEIGHTS,
  weightVector
} from "./clustering";
import type { Cluster, Recording } from "@/types";

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

  it("default weights produce the same result as plain cosine (back-compat)", () => {
    const a = [1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.6, 0.7, 0.8];
    const b = [2, 1, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0.4, 0.6, 0.9, 0.7];
    const plain = cosineSimilarity(a, b);
    const defaultScaled = cosineSimilarity(a, b, weightVector(DEFAULT_SIMILARITY_WEIGHTS));
    expect(defaultScaled).toBeCloseTo(plain, 10);
  });

  it("weighting tempo to zero ignores the tempo dimension entirely", () => {
    // Two vectors with identical pitch-class halves but different tempo
    // values. With tempo=0 weighting they should be perfectly similar;
    // with default weights the tempo gap should drag similarity down.
    const a = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0];
    const b = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0];

    const withTempo = cosineSimilarity(a, b, weightVector(DEFAULT_SIMILARITY_WEIGHTS));
    const ignoreTempo = cosineSimilarity(
      a,
      b,
      weightVector({ ...DEFAULT_SIMILARITY_WEIGHTS, tempo: 0 })
    );

    expect(ignoreTempo).toBeCloseTo(1, 5);
    expect(withTempo).toBeLessThan(ignoreTempo);
  });

  it("rhythm-heavy weighting can flip which pair is most similar", () => {
    // Three recordings:
    //   x and y share pitch but differ in tempo.
    //   x and z share tempo but differ in pitch.
    // Default weights say y is closer to x. Bumping tempo to 5×
    // and dropping pitchClass to 0.1× should flip z to the closer pair.
    const x = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0];
    const y = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0];
    const z = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0];

    const corpus = [recording("x", x), recording("y", y), recording("z", z)];

    const defaultEdges = buildSimilarityEdges(corpus, 0).map((e) => `${e.source}-${e.target}`);
    const rhythmEdges = buildSimilarityEdges(corpus, 0, {
      ...DEFAULT_SIMILARITY_WEIGHTS,
      pitchClass: 0.1,
      tempo: 5
    }).map((e) => `${e.source}-${e.target}`);

    // Sanity: both rule-sets produce three pairwise edges (no self
    // loops). The interesting bit is the ranking — the top edge under
    // default weights names x-y; under rhythm-heavy weights it names
    // x-z.
    expect(defaultEdges).toHaveLength(3);
    expect(rhythmEdges).toHaveLength(3);
    expect(defaultEdges[0]).toBe("x-y");
    expect(rhythmEdges[0]).toBe("x-z");
  });

  it("clusterRecordings respects the weights argument", () => {
    const x = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0];
    const y = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0, 0];
    const z = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0];
    const corpus = [recording("x", x), recording("y", y), recording("z", z)];

    // At a high threshold (0.95) under default weights, only the
    // pitch-aligned pair x-y survives — z is too far in pitch space.
    // Under tempo-heavy weights, the picture flips: x-z survives,
    // x-y doesn't. This is the same flip we tested at the edge level,
    // surfaced through the full clusterRecordings pipeline.
    const defaultGroups = clusterRecordings(corpus, 0.95);
    const rhythmGroups = clusterRecordings(corpus, 0.95, {
      ...DEFAULT_SIMILARITY_WEIGHTS,
      pitchClass: 0.1,
      tempo: 5
    });

    function clusterContaining(groups: Cluster[], a: string, b: string): boolean {
      return groups.some((g) => g.recordingIds.includes(a) && g.recordingIds.includes(b));
    }

    // Under default weights at this threshold none of the three
    // recordings cluster — tempo gap drags x-y below, pitch gap drags
    // x-z below. Switching to tempo-heavy weights brings x-z over the
    // line because their tempo column now dominates the cosine.
    expect(clusterContaining(defaultGroups, "x", "z")).toBe(false);
    expect(clusterContaining(rhythmGroups, "x", "z")).toBe(true);
  });
});
