import { describe, expect, it } from "vitest";
import { analyzeSamples, detectMode, frequencyToMidi } from "./audioAnalysis";

describe("audio analysis", () => {
  it("detects a clear C ionian pitch-class profile", () => {
    const profile = [0.22, 0, 0.14, 0, 0.18, 0.12, 0, 0.18, 0, 0.1, 0, 0.06];
    const result = detectMode(profile);
    expect(result.tonic).toBe("C");
    expect(result.mode).toBe("Ionian");
    expect(result.confidence).toBeGreaterThan(0.1);
  });

  it("extracts notes from a synthetic sine tone", () => {
    const sampleRate = 22050;
    const duration = 1.4;
    const samples = new Float32Array(sampleRate * duration);
    for (let i = 0; i < samples.length; i += 1) {
      samples[i] = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.6;
    }

    const analysis = analyzeSamples({ samples, sampleRate, channels: 1, duration });
    expect(analysis.notes.length).toBeGreaterThan(0);
    expect(frequencyToMidi(analysis.phonetics.averagePitchHz)).toBe(69);
  });
});
