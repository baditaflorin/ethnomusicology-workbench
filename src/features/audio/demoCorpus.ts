import { analyzeSamples, recordingFromAnalysis } from "./audioAnalysis";
import type { Recording } from "@/types";

type DemoPattern = {
  name: string;
  baseFrequency: number;
  intervals: number[];
  modeHint: string;
};

const DEMO_PATTERNS: DemoPattern[] = [
  {
    name: "Demo - mountain flute mode",
    baseFrequency: 261.63,
    intervals: [0, 2, 4, 7, 9, 7, 4, 2],
    modeHint: "Ionian"
  },
  {
    name: "Demo - shepherd chant contour",
    baseFrequency: 293.66,
    intervals: [0, 2, 3, 5, 7, 9, 7, 5, 3],
    modeHint: "Dorian"
  },
  {
    name: "Demo - laments over drone",
    baseFrequency: 220,
    intervals: [0, 1, 3, 5, 7, 8, 7, 5, 3, 1],
    modeHint: "Phrygian"
  }
];

export const createDemoCorpus = (): Recording[] =>
  DEMO_PATTERNS.map((pattern) => {
    const sampleRate = 22050;
    const secondsPerNote = 0.42;
    const duration = pattern.intervals.length * secondsPerNote + 0.2;
    const samples = new Float32Array(Math.floor(sampleRate * duration));
    const droneFrequency = pattern.baseFrequency / 2;

    for (let i = 0; i < samples.length; i += 1) {
      const time = i / sampleRate;
      const noteIndex = Math.min(pattern.intervals.length - 1, Math.floor(time / secondsPerNote));
      const localTime = time - noteIndex * secondsPerNote;
      const envelope = Math.sin(Math.min(1, localTime / secondsPerNote) * Math.PI);
      const interval = pattern.intervals[noteIndex] ?? 0;
      const frequency = pattern.baseFrequency * 2 ** (interval / 12);
      const melody = Math.sin(2 * Math.PI * frequency * time) * 0.46 * envelope;
      const harmonic = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.08 * envelope;
      const drone = Math.sin(2 * Math.PI * droneFrequency * time) * 0.08;
      const pulse = Math.sin(2 * Math.PI * 3.2 * time) > 0.92 ? 0.04 : 0;
      samples[i] = melody + harmonic + drone + pulse;
    }

    const analysis = analyzeSamples({
      samples,
      sampleRate,
      channels: 1,
      duration,
      engine: `Synthetic demo ${pattern.modeHint} corpus`
    });
    return recordingFromAnalysis(pattern.name, "demo", analysis);
  });
