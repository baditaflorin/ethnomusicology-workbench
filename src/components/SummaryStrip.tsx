import { BarChart3, Clock, FileAudio, Music2 } from "lucide-react";
import type { ReactNode } from "react";
import { corpusMetrics } from "@/features/corpus/clustering";
import { formatNumber, formatSeconds } from "@/shared/format";
import type { Recording } from "@/types";

export const SummaryStrip = ({ recordings }: { recordings: Recording[] }) => {
  const metrics = corpusMetrics(recordings);
  const topMode = metrics.topModes[0]?.[0] ?? "No mode yet";

  return (
    <section className="summary-strip" aria-label="Corpus summary">
      <Metric
        icon={<FileAudio size={20} />}
        label="Recordings"
        value={String(metrics.recordings)}
      />
      <Metric
        icon={<Clock size={20} />}
        label="Total duration"
        value={formatSeconds(metrics.totalDuration)}
      />
      <Metric icon={<Music2 size={20} />} label="Transcribed notes" value={String(metrics.notes)} />
      <Metric
        icon={<BarChart3 size={20} />}
        label="Average tempo"
        value={`${formatNumber(metrics.averageTempo, 0)} bpm`}
      />
      <Metric icon={<Music2 size={20} />} label="Leading mode" value={topMode} />
    </section>
  );
};

const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="metric">
    <span aria-hidden="true">{icon}</span>
    <small>{label}</small>
    <strong>{value}</strong>
  </div>
);
