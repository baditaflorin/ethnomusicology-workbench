import { Database, Download, Sigma } from "lucide-react";
import { useState } from "react";
import { corpusMetrics } from "@/features/corpus/clustering";
import { runDuckDbSummary } from "@/features/engines/duckdbEngine";
import { runWebRSummary } from "@/features/engines/webrEngine";
import { downloadArtifact, exportCorpusCsv } from "@/features/exports/exporters";
import { formatNumber, formatSeconds } from "@/shared/format";
import { useToasts } from "@/shared/toast";
import type { Recording } from "@/types";

export const StatsPanel = ({ recordings }: { recordings: Recording[] }) => {
  const metrics = corpusMetrics(recordings);
  const { pushToast } = useToasts();
  const [duckDbOutput, setDuckDbOutput] = useState("");
  const [webROutput, setWebROutput] = useState("");
  const [busy, setBusy] = useState<"duckdb" | "webr" | undefined>();

  const runDuckDb = async () => {
    setBusy("duckdb");
    try {
      setDuckDbOutput(await runDuckDbSummary(recordings));
      pushToast("success", "DuckDB-WASM summary finished locally.");
    } catch (error) {
      pushToast("error", error instanceof Error ? error.message : "DuckDB-WASM failed to load.");
    } finally {
      setBusy(undefined);
    }
  };

  const runWebR = async () => {
    setBusy("webr");
    try {
      setWebROutput(await runWebRSummary(recordings));
      pushToast("success", "WebR summary finished locally.");
    } catch (error) {
      pushToast("error", error instanceof Error ? error.message : "WebR failed to load.");
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <section className="panel work-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">statistical analysis</p>
          <h2>Corpus profile</h2>
        </div>
        <button
          className="export-button compact"
          disabled={recordings.length === 0}
          onClick={() => downloadArtifact(exportCorpusCsv(recordings))}
          type="button"
        >
          <Download size={16} />
          CSV
        </button>
      </div>
      <div className="stats-grid">
        <Stat label="Recordings" value={String(metrics.recordings)} />
        <Stat label="Total duration" value={formatSeconds(metrics.totalDuration)} />
        <Stat label="Average duration" value={formatSeconds(metrics.averageDuration)} />
        <Stat label="Average tempo" value={`${formatNumber(metrics.averageTempo, 0)} bpm`} />
      </div>
      <div className="mode-table">
        <h3>Mode distribution</h3>
        {metrics.topModes.map(([mode, count]) => (
          <div className="mode-row" key={mode}>
            <span>{mode}</span>
            <strong>{count}</strong>
          </div>
        ))}
        {metrics.topModes.length === 0 ? <p>No modes yet.</p> : null}
      </div>
      <div className="engine-actions">
        <button
          disabled={busy !== undefined || recordings.length === 0}
          onClick={runDuckDb}
          type="button"
        >
          <Database size={17} />
          Run DuckDB-WASM SQL
        </button>
        <button
          className="secondary"
          disabled={busy !== undefined || recordings.length === 0}
          onClick={runWebR}
          type="button"
        >
          <Sigma size={17} />
          Run WebR stats
        </button>
      </div>
      {duckDbOutput ? <pre className="code-preview">{duckDbOutput}</pre> : null}
      {webROutput ? <pre className="code-preview">{webROutput}</pre> : null}
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="stat-tile">
    <small>{label}</small>
    <strong>{value}</strong>
  </div>
);
