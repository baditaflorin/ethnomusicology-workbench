import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { formatSeconds } from "@/shared/format";
import type { Annotation, Recording } from "@/types";

const tiers: Annotation["tier"][] = [
  "researcher",
  "phonetics",
  "translation",
  "performance",
  "context"
];

export const TimelinePanel = ({
  recording,
  onUpdate
}: {
  recording?: Recording;
  onUpdate: (recording: Recording) => void;
}) => {
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("1");
  const [tier, setTier] = useState<Annotation["tier"]>("researcher");
  const [value, setValue] = useState("");

  const timeline = useMemo(() => recording?.analysis.timeline ?? [], [recording]);

  if (!recording) {
    return <EmptyPanel title="Timeline" message="Import or generate a recording to annotate it." />;
  }

  const addAnnotation = () => {
    const parsedStart = clamp(Number(start), 0, recording.duration);
    const parsedEnd = clamp(Number(end), parsedStart + 0.01, recording.duration);
    if (!value.trim()) {
      return;
    }
    const annotation: Annotation = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      tier,
      start: parsedStart,
      end: parsedEnd,
      value: value.trim(),
      createdAt: new Date().toISOString()
    };
    onUpdate({
      ...recording,
      annotations: [...recording.annotations, annotation]
    });
    setValue("");
  };

  const deleteAnnotation = (id: string) => {
    onUpdate({
      ...recording,
      annotations: recording.annotations.filter((annotation) => annotation.id !== id)
    });
  };

  return (
    <section className="panel work-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">annotation timeline</p>
          <h2>{recording.name}</h2>
        </div>
        <span className="small-stat">{formatSeconds(recording.duration)}</span>
      </div>
      <div className="timeline-ruler" aria-label="Automatic transcription timeline">
        {timeline.slice(0, 80).map((segment) => (
          <span
            className={`timeline-segment segment-${segment.kind}`}
            key={segment.id}
            style={{
              left: `${(segment.start / recording.duration) * 100}%`,
              width: `${Math.max(0.6, ((segment.end - segment.start) / recording.duration) * 100)}%`
            }}
            title={`${segment.label} ${formatSeconds(segment.start)}-${formatSeconds(segment.end)}`}
          >
            {segment.label}
          </span>
        ))}
      </div>
      <div className="annotation-form">
        <label>
          Start
          <input
            max={recording.duration}
            min="0"
            onChange={(event) => setStart(event.target.value)}
            step="0.01"
            type="number"
            value={start}
          />
        </label>
        <label>
          End
          <input
            max={recording.duration}
            min="0"
            onChange={(event) => setEnd(event.target.value)}
            step="0.01"
            type="number"
            value={end}
          />
        </label>
        <label>
          Tier
          <select
            onChange={(event) => setTier(event.target.value as Annotation["tier"])}
            value={tier}
          >
            {tiers.map((tierName) => (
              <option key={tierName} value={tierName}>
                {tierName}
              </option>
            ))}
          </select>
        </label>
        <label className="annotation-value">
          Annotation
          <input
            onChange={(event) => setValue(event.target.value)}
            placeholder="Motif, vowel, translation, context..."
            type="text"
            value={value}
          />
        </label>
        <button onClick={addAnnotation} type="button">
          <Plus size={17} />
          Add
        </button>
      </div>
      <div className="annotation-list">
        {recording.annotations.map((annotation) => (
          <div className="annotation-row" key={annotation.id}>
            <span className={`tier-dot tier-${annotation.tier}`} />
            <strong>{annotation.tier}</strong>
            <span>
              {formatSeconds(annotation.start)}-{formatSeconds(annotation.end)}
            </span>
            <p>{annotation.value}</p>
            <button
              className="icon-button"
              onClick={() => deleteAnnotation(annotation.id)}
              title="Delete annotation"
              type="button"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {recording.annotations.length === 0 ? (
          <div className="quiet-empty">
            <p>No manual annotations yet. Automatic segments are already exportable.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const EmptyPanel = ({ title, message }: { title: string; message: string }) => (
  <section className="panel work-panel empty-panel">
    <p className="eyebrow">{title}</p>
    <h2>{message}</h2>
  </section>
);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
