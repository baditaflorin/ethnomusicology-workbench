import type { Cluster, Recording } from "@/types";

export type SimilarityEdge = {
  source: string;
  target: string;
  similarity: number;
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
  const length = Math.max(a.length, b.length);
  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;
  for (let i = 0; i < length; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    aMagnitude += av * av;
    bMagnitude += bv * bv;
  }
  if (aMagnitude === 0 || bMagnitude === 0) {
    return 0;
  }
  return dot / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
};

export const buildSimilarityEdges = (
  recordings: Recording[],
  threshold = 0.78
): SimilarityEdge[] => {
  const edges: SimilarityEdge[] = [];
  for (let i = 0; i < recordings.length; i += 1) {
    for (let j = i + 1; j < recordings.length; j += 1) {
      const source = recordings[i];
      const target = recordings[j];
      if (!source || !target) {
        continue;
      }
      const similarity = cosineSimilarity(
        source.analysis.similarityVector,
        target.analysis.similarityVector
      );
      if (similarity >= threshold) {
        edges.push({
          source: source.id,
          target: target.id,
          similarity
        });
      }
    }
  }
  return edges.sort((a, b) => b.similarity - a.similarity);
};

export const clusterRecordings = (recordings: Recording[], threshold = 0.78): Cluster[] => {
  const edges = buildSimilarityEdges(recordings, threshold);
  const parent = new Map<string, string>();
  recordings.forEach((recording) => parent.set(recording.id, recording.id));

  const find = (id: string): string => {
    const current = parent.get(id);
    if (!current || current === id) {
      return id;
    }
    const root = find(current);
    parent.set(id, root);
    return root;
  };

  const union = (a: string, b: string) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent.set(rootB, rootA);
    }
  };

  edges.forEach((edge) => union(edge.source, edge.target));
  const groups = new Map<string, Recording[]>();
  recordings.forEach((recording) => {
    const root = find(recording.id);
    groups.set(root, [...(groups.get(root) ?? []), recording]);
  });

  return [...groups.values()].map((group, index) => ({
    id: `cluster-${index + 1}`,
    label: `Cluster ${index + 1}`,
    recordingIds: group.map((recording) => recording.id),
    centroid: centroid(group.map((recording) => recording.analysis.similarityVector))
  }));
};

export const corpusMetrics = (recordings: Recording[]) => {
  const durations = recordings.map((recording) => recording.duration);
  const notes = recordings.flatMap((recording) => recording.analysis.notes);
  const modes = new Map<string, number>();
  recordings.forEach((recording) => {
    const label = `${recording.analysis.keyMode.tonic} ${recording.analysis.keyMode.mode}`;
    modes.set(label, (modes.get(label) ?? 0) + 1);
  });

  return {
    recordings: recordings.length,
    totalDuration: durations.reduce((sum, duration) => sum + duration, 0),
    averageDuration: average(durations),
    notes: notes.length,
    averageTempo: average(recordings.map((recording) => recording.analysis.tempoEstimate)),
    topModes: [...modes.entries()].sort((a, b) => b[1] - a[1])
  };
};

const centroid = (vectors: number[][]): number[] => {
  const length = Math.max(0, ...vectors.map((vector) => vector.length));
  const output = Array.from({ length }, () => 0);
  vectors.forEach((vector) => {
    for (let i = 0; i < length; i += 1) {
      output[i] += vector[i] ?? 0;
    }
  });
  return output.map((value) => value / Math.max(1, vectors.length));
};

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};
