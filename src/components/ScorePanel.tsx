import { Download, FileCode2, Music } from "lucide-react";
import {
  downloadArtifact,
  exportElanEaf,
  exportLilyPond,
  exportMusicXml,
  exportPraatTextGrid,
  exportRecordingJson
} from "@/features/exports/exporters";
import { formatPercent } from "@/shared/format";
import type { Recording, TranscribedNote } from "@/types";
import { EmptyPanel } from "./TimelinePanel";

export const ScorePanel = ({ recording }: { recording?: Recording }) => {
  if (!recording) {
    return (
      <EmptyPanel title="Score" message="Select a recording to inspect and export notation." />
    );
  }

  return (
    <section className="panel work-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">score export</p>
          <h2>
            {recording.analysis.keyMode.tonic} {recording.analysis.keyMode.mode}
          </h2>
        </div>
        <span className="small-stat">{formatPercent(recording.analysis.keyMode.confidence)}</span>
      </div>
      <ScorePreview notes={recording.analysis.notes} />
      <div className="export-grid">
        <ExportButton
          label="MusicXML"
          onClick={() => downloadArtifact(exportMusicXml(recording))}
        />
        <ExportButton
          label="LilyPond"
          onClick={() => downloadArtifact(exportLilyPond(recording))}
        />
        <ExportButton label="ELAN EAF" onClick={() => downloadArtifact(exportElanEaf(recording))} />
        <ExportButton
          label="Praat TextGrid"
          onClick={() => downloadArtifact(exportPraatTextGrid(recording))}
        />
        <ExportButton
          label="Analysis JSON"
          onClick={() => downloadArtifact(exportRecordingJson(recording))}
        />
      </div>
      <pre className="code-preview" aria-label="LilyPond preview">
        {exportLilyPond(recording).content}
      </pre>
    </section>
  );
};

const ExportButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button className="export-button" onClick={onClick} type="button">
    <Download size={17} />
    {label}
  </button>
);

const ScorePreview = ({ notes }: { notes: TranscribedNote[] }) => {
  const visible = notes.slice(0, 48);
  const width = 920;
  const height = 190;
  const minMidi = Math.min(55, ...visible.map((note) => note.midi));
  const maxMidi = Math.max(84, ...visible.map((note) => note.midi));
  const range = Math.max(1, maxMidi - minMidi);

  return (
    <div className="score-preview" aria-label="Automatic score preview">
      <div className="score-toolbar">
        <span>
          <Music size={17} /> {notes.length} notes
        </span>
        <span>
          <FileCode2 size={17} /> MusicXML and LilyPond-ready
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Score preview">
        {[0, 1, 2, 3, 4].map((line) => (
          <line
            className="staff-line"
            key={line}
            x1="24"
            x2={width - 24}
            y1={55 + line * 18}
            y2={55 + line * 18}
          />
        ))}
        {visible.map((note, index) => {
          const x = 44 + (index / Math.max(1, visible.length - 1)) * (width - 98);
          const y = 130 - ((note.midi - minMidi) / range) * 86;
          return (
            <g key={note.id}>
              <ellipse
                className="note-head"
                cx={x}
                cy={y}
                rx="8"
                ry="5.6"
                transform={`rotate(-18 ${x} ${y})`}
              />
              <line className="note-stem" x1={x + 7} x2={x + 7} y1={y} y2={y - 38} />
              <text className="note-label" x={x - 10} y={height - 22}>
                {note.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
