import type {
  KeyMode,
  ModeName,
  Recording,
  RecordingAnalysis,
  TimelineSegment,
  TranscribedNote
} from "@/types";

export const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const MODE_INTERVALS: Record<ModeName, number[]> = {
  Ionian: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10]
};

const SCALE_WEIGHTS = [1.35, 0.78, 0.96, 0.74, 1.16, 0.86, 0.72];

type PitchFrame = {
  time: number;
  midi: number;
  frequency: number;
  confidence: number;
  rms: number;
};

export type SampleAnalysisInput = {
  samples: Float32Array;
  sampleRate: number;
  channels: number;
  duration: number;
};

export const analyzeAudioBuffer = async (
  buffer: AudioBuffer,
  engine = "Web Audio autocorrelation"
): Promise<RecordingAnalysis> => {
  const mono = mixToMono(buffer);
  return analyzeSamples({
    samples: mono,
    sampleRate: buffer.sampleRate,
    channels: buffer.numberOfChannels,
    duration: buffer.duration,
    engine
  });
};

export const analyzeSamples = ({
  samples,
  sampleRate,
  channels,
  duration,
  engine = "Web Audio autocorrelation"
}: SampleAnalysisInput & { engine?: string }): RecordingAnalysis => {
  const frameSize = Math.min(2048, Math.max(512, Math.floor(samples.length / 12)));
  const targetFrames = 420;
  const hopSize = Math.max(512, Math.floor(Math.max(samples.length - frameSize, 1) / targetFrames));
  const energyFrames: number[] = [];
  const pitchFrames: PitchFrame[] = [];
  const pitchClassProfile = Array.from({ length: 12 }, () => 0);
  let zeroCrossings = 0;
  let sumSquares = 0;
  let peak = 0;

  for (let i = 1; i < samples.length; i += 1) {
    const sample = samples[i] ?? 0;
    const previous = samples[i - 1] ?? 0;
    sumSquares += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
    if ((sample >= 0 && previous < 0) || (sample < 0 && previous >= 0)) {
      zeroCrossings += 1;
    }
  }

  const totalFrames = Math.max(1, Math.floor((samples.length - frameSize) / hopSize));
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
    const start = frameIndex * hopSize;
    const frame = samples.subarray(start, start + frameSize);
    const rms = rootMeanSquare(frame);
    energyFrames.push(rms);
    const pitch = estimatePitch(frame, sampleRate, rms);
    if (pitch) {
      const midi = frequencyToMidi(pitch.frequency);
      const pitchClass = ((midi % 12) + 12) % 12;
      const weight = rms * pitch.confidence;
      pitchClassProfile[pitchClass] += weight;
      pitchFrames.push({
        time: start / sampleRate,
        midi,
        frequency: pitch.frequency,
        confidence: pitch.confidence,
        rms
      });
    }
  }

  normalizeInPlace(pitchClassProfile);
  const notes = buildNotes(pitchFrames, hopSize / sampleRate, duration);
  const timeline = buildTimeline(notes, duration);
  const keyMode = detectMode(pitchClassProfile);
  const voicedFrequencies = pitchFrames.map((frame) => frame.frequency);
  const averagePitchHz = average(voicedFrequencies);
  const pitchRangeHz: [number, number] =
    voicedFrequencies.length > 0
      ? [Math.min(...voicedFrequencies), Math.max(...voicedFrequencies)]
      : [0, 0];
  const spectralCentroid = estimateSpectralCentroid(samples, sampleRate);
  const onsetRate = estimateOnsetRate(energyFrames, duration);
  const tempoEstimate = Math.max(0, Math.round(onsetRate * 60));
  const rms = Math.sqrt(sumSquares / Math.max(1, samples.length));
  const zeroCrossingRate = zeroCrossings / Math.max(1, samples.length - 1);

  return {
    schemaVersion: 1,
    engine,
    generatedAt: new Date().toISOString(),
    duration,
    sampleRate,
    channels,
    rms,
    peak,
    zeroCrossingRate,
    spectralCentroid,
    onsetRate,
    tempoEstimate,
    pitchClassProfile,
    keyMode,
    notes,
    timeline,
    similarityVector: buildSimilarityVector({
      pitchClassProfile,
      tempoEstimate,
      spectralCentroid,
      rms,
      voicedRatio: voicedFrequencies.length / Math.max(1, totalFrames)
    }),
    phonetics: {
      voicedRatio: voicedFrequencies.length / Math.max(1, totalFrames),
      averagePitchHz,
      pitchRangeHz
    }
  };
};

export const recordingFromAnalysis = (
  name: string,
  source: Recording["source"],
  analysis: RecordingAnalysis
): Recording => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name,
  source,
  createdAt: new Date().toISOString(),
  duration: analysis.duration,
  sampleRate: analysis.sampleRate,
  channels: analysis.channels,
  analysis,
  annotations: []
});

export const frequencyToMidi = (frequency: number): number =>
  Math.round(69 + 12 * Math.log2(frequency / 440));

export const midiToNoteName = (midi: number): { name: string; octave: number } => {
  const pitchClass = ((midi % 12) + 12) % 12;
  return {
    name: NOTE_NAMES[pitchClass] ?? "C",
    octave: Math.floor(midi / 12) - 1
  };
};

export const detectMode = (profile: number[]): KeyMode => {
  const candidates: KeyMode["alternatives"] = [];
  const normalized = [...profile];
  normalizeInPlace(normalized);

  for (let tonic = 0; tonic < 12; tonic += 1) {
    for (const [mode, intervals] of Object.entries(MODE_INTERVALS) as Array<[ModeName, number[]]>) {
      let score = 0;
      for (let pc = 0; pc < 12; pc += 1) {
        const intervalIndex = intervals.indexOf((pc - tonic + 12) % 12);
        if (intervalIndex >= 0) {
          score += normalized[pc] * (SCALE_WEIGHTS[intervalIndex] ?? 0.8);
        } else {
          score -= normalized[pc] * 0.22;
        }
      }
      candidates.push({
        tonic: NOTE_NAMES[tonic] ?? "C",
        mode,
        score
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0] ?? { tonic: "C", mode: "Ionian" as ModeName, score: 0 };
  const second = candidates[1]?.score ?? 0;
  const confidence = clamp((best.score - second + 0.08) / 0.42, 0, 1);

  return {
    tonic: best.tonic,
    mode: best.mode,
    confidence,
    alternatives: candidates.slice(0, 5)
  };
};

const mixToMono = (buffer: AudioBuffer): Float32Array => {
  const output = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < buffer.length; i += 1) {
      output[i] += (data[i] ?? 0) / buffer.numberOfChannels;
    }
  }
  return output;
};

const estimatePitch = (
  frame: Float32Array,
  sampleRate: number,
  rms: number
): { frequency: number; confidence: number } | null => {
  if (rms < 0.008) {
    return null;
  }

  const minFrequency = 55;
  const maxFrequency = 1600;
  const minLag = Math.floor(sampleRate / maxFrequency);
  const maxLag = Math.min(Math.floor(sampleRate / minFrequency), Math.floor(frame.length / 2));
  let bestLag = 0;
  let bestScore = Number.POSITIVE_INFINITY;
  let baseline = 0;

  for (let i = 0; i < frame.length - maxLag; i += 4) {
    baseline += Math.abs(frame[i] ?? 0);
  }

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let diff = 0;
    for (let i = 0; i < frame.length - lag; i += 4) {
      diff += Math.abs((frame[i] ?? 0) - (frame[i + lag] ?? 0));
    }
    const normalized = diff / Math.max(0.000001, baseline);
    if (normalized < bestScore) {
      bestScore = normalized;
      bestLag = lag;
    }
  }

  const confidence = clamp(1 - bestScore * 2.4, 0, 1);
  if (!bestLag || confidence < 0.22) {
    return null;
  }

  return {
    frequency: sampleRate / bestLag,
    confidence
  };
};

const buildNotes = (
  pitchFrames: PitchFrame[],
  hopSeconds: number,
  duration: number
): TranscribedNote[] => {
  const notes: TranscribedNote[] = [];
  let active:
    | {
        start: number;
        end: number;
        midiValues: number[];
        frequencies: number[];
        confidenceValues: number[];
      }
    | undefined;

  const flush = () => {
    if (!active) {
      return;
    }
    const noteDuration = Math.max(hopSeconds, active.end - active.start);
    if (noteDuration >= 0.08) {
      const midi = Math.round(average(active.midiValues));
      const { name, octave } = midiToNoteName(midi);
      notes.push({
        id: `note-${notes.length + 1}`,
        start: round(active.start),
        end: round(Math.min(duration, active.end)),
        duration: round(noteDuration),
        midi,
        frequency: round(average(active.frequencies), 2),
        name,
        octave,
        confidence: round(average(active.confidenceValues), 3)
      });
    }
    active = undefined;
  };

  for (const frame of pitchFrames) {
    const frameEnd = frame.time + hopSeconds;
    const shouldContinue =
      active &&
      Math.abs(frame.midi - average(active.midiValues)) <= 1 &&
      frame.time - active.end <= hopSeconds * 2.2;

    if (!shouldContinue) {
      flush();
      active = {
        start: frame.time,
        end: frameEnd,
        midiValues: [frame.midi],
        frequencies: [frame.frequency],
        confidenceValues: [frame.confidence]
      };
      continue;
    }

    if (active) {
      active.end = frameEnd;
      active.midiValues.push(frame.midi);
      active.frequencies.push(frame.frequency);
      active.confidenceValues.push(frame.confidence);
    }
  }

  flush();
  return notes.slice(0, 512);
};

const buildTimeline = (notes: TranscribedNote[], duration: number): TimelineSegment[] => {
  if (notes.length === 0) {
    return [
      {
        id: "texture-1",
        start: 0,
        end: round(duration),
        label: "Unpitched texture",
        kind: "texture",
        confidence: 0.4
      }
    ];
  }

  return notes.map((note) => ({
    id: `segment-${note.id}`,
    start: note.start,
    end: note.end,
    label: `${note.name}${note.octave}`,
    kind: "note",
    confidence: note.confidence
  }));
};

const estimateOnsetRate = (energyFrames: number[], duration: number): number => {
  if (energyFrames.length < 3 || duration <= 0) {
    return 0;
  }
  const mean = average(energyFrames);
  const sd = Math.sqrt(average(energyFrames.map((value) => (value - mean) ** 2)));
  let peaks = 0;
  for (let i = 1; i < energyFrames.length - 1; i += 1) {
    const current = energyFrames[i] ?? 0;
    if (current > (energyFrames[i - 1] ?? 0) && current > (energyFrames[i + 1] ?? 0)) {
      if (current > mean + sd * 0.35) {
        peaks += 1;
      }
    }
  }
  return peaks / duration;
};

const estimateSpectralCentroid = (samples: Float32Array, sampleRate: number): number => {
  if (samples.length === 0) {
    return 0;
  }
  const windowSize = Math.min(1024, samples.length);
  const step = Math.max(windowSize * 8, Math.floor(samples.length / 18));
  let weighted = 0;
  let magnitudeTotal = 0;

  for (let start = 0; start + windowSize < samples.length; start += step) {
    for (let bin = 1; bin <= 96; bin += 1) {
      const frequency = (bin * sampleRate) / windowSize;
      let real = 0;
      let imaginary = 0;
      for (let i = 0; i < windowSize; i += 4) {
        const angle = (2 * Math.PI * bin * i) / windowSize;
        const sample = samples[start + i] ?? 0;
        real += sample * Math.cos(angle);
        imaginary -= sample * Math.sin(angle);
      }
      const magnitude = Math.sqrt(real * real + imaginary * imaginary);
      weighted += frequency * magnitude;
      magnitudeTotal += magnitude;
    }
  }

  return round(weighted / Math.max(0.000001, magnitudeTotal), 2);
};

const buildSimilarityVector = ({
  pitchClassProfile,
  tempoEstimate,
  spectralCentroid,
  rms,
  voicedRatio
}: {
  pitchClassProfile: number[];
  tempoEstimate: number;
  spectralCentroid: number;
  rms: number;
  voicedRatio: number;
}): number[] => {
  const vector = [
    ...pitchClassProfile,
    clamp(tempoEstimate / 180, 0, 2),
    clamp(spectralCentroid / 4000, 0, 2),
    clamp(rms * 8, 0, 2),
    clamp(voicedRatio, 0, 1)
  ];
  normalizeInPlace(vector);
  return vector;
};

const rootMeanSquare = (frame: Float32Array): number => {
  let sum = 0;
  for (const sample of frame) {
    sum += sample * sample;
  }
  return Math.sqrt(sum / Math.max(1, frame.length));
};

const normalizeInPlace = (values: number[]): void => {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total <= 0) {
    const equal = 1 / Math.max(1, values.length);
    values.fill(equal);
    return;
  }
  for (let i = 0; i < values.length; i += 1) {
    values[i] = Math.max(0, values[i] ?? 0) / total;
  }
};

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const round = (value: number, places = 3): number => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};
