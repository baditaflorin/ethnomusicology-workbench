import { FileAudio, Trash2 } from "lucide-react";
import { formatPercent, formatSeconds } from "@/shared/format";
import type { Recording } from "@/types";

export const CorpusList = ({
  activeId,
  recordings,
  onDelete,
  onSelect
}: {
  activeId?: string;
  recordings: Recording[];
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}) => (
  <aside className="panel corpus-panel" data-testid="corpus-panel">
    <div className="panel-heading">
      <div>
        <p className="eyebrow">corpus</p>
        <h2>{recordings.length} recordings</h2>
      </div>
    </div>
    <div className="recording-list">
      {recordings.map((recording) => (
        <button
          className={`recording-card ${activeId === recording.id ? "active" : ""}`}
          key={recording.id}
          onClick={() => onSelect(recording.id)}
          type="button"
        >
          <span className="recording-icon">
            <FileAudio size={18} />
          </span>
          <span className="recording-copy">
            <strong>{recording.name}</strong>
            <small>
              {formatSeconds(recording.duration)} · {recording.analysis.notes.length} notes ·{" "}
              {recording.analysis.keyMode.tonic} {recording.analysis.keyMode.mode}
            </small>
            <small>{formatPercent(recording.analysis.keyMode.confidence)} mode confidence</small>
          </span>
          <span
            className="icon-button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(recording.id);
            }}
            role="button"
            tabIndex={0}
            title="Delete recording"
          >
            <Trash2 size={16} />
          </span>
        </button>
      ))}
      {recordings.length === 0 ? (
        <div className="quiet-empty">
          <p>No recordings yet.</p>
        </div>
      ) : null}
    </div>
  </aside>
);
