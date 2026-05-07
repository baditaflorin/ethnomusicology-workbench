import { Cpu, Mic, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { engineCatalog } from "@/features/engines/engineCatalog";
import { runLocalWhisperProbe } from "@/features/engines/whisperEngine";
import { useToasts } from "@/shared/toast";
import type { Recording } from "@/types";

export const EnginePanel = ({ recording }: { recording?: Recording }) => {
  const { pushToast } = useToasts();
  const [whisperOutput, setWhisperOutput] = useState("");
  const [busy, setBusy] = useState(false);

  const probeWhisper = async () => {
    if (!recording) {
      return;
    }
    setBusy(true);
    try {
      const result = await runLocalWhisperProbe(recording);
      setWhisperOutput(`${result.engine}: ${result.text}`);
      pushToast("success", "Whisper adapter loaded.");
    } catch (error) {
      pushToast(
        "error",
        error instanceof Error ? error.message : "Whisper adapter failed to load."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel work-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">engine registry</p>
          <h2>Local research stack</h2>
        </div>
        <span className="privacy-badge">
          <ShieldCheck size={16} />
          no upload path
        </span>
      </div>
      <div className="engine-grid">
        {engineCatalog.map((engine) => (
          <div className="engine-row" key={engine.name}>
            <span className={`engine-status ${engine.status}`}>{engine.status}</span>
            <div>
              <strong>{engine.name}</strong>
              <small>{engine.role}</small>
              <p>{engine.notes}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="engine-actions">
        <button disabled={!recording || busy} onClick={probeWhisper} type="button">
          <Mic size={17} />
          Probe local Whisper adapter
        </button>
        <span className="engine-note">
          <Cpu size={16} />
          Heavy runtimes load only after you ask for them.
        </span>
      </div>
      {whisperOutput ? <pre className="code-preview">{whisperOutput}</pre> : null}
    </section>
  );
};
