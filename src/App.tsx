import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { analyzeAudioBuffer, recordingFromAnalysis } from "@/features/audio/audioAnalysis";
import { createDemoCorpus } from "@/features/audio/demoCorpus";
import {
  clearRecordings,
  deleteRecording,
  loadRecordings,
  saveRecording,
  saveRecordings
} from "@/shared/storage";
import { ErrorBoundary } from "@/shared/ErrorBoundary";
import { ToastProvider, ToastViewport, useToasts } from "@/shared/toast";
import type { Recording } from "@/types";
import { CorpusList } from "./components/CorpusList";
import { DropZone } from "./components/DropZone";
import { EnginePanel } from "./components/EnginePanel";
import { GraphPanel } from "./components/GraphPanel";
import { Header } from "./components/Header";
import { ScorePanel } from "./components/ScorePanel";
import { StatsPanel } from "./components/StatsPanel";
import { SummaryStrip } from "./components/SummaryStrip";
import { TabNav, type WorkbenchTab } from "./components/TabNav";
import { TimelinePanel } from "./components/TimelinePanel";

export const App = () => (
  <ErrorBoundary>
    <ToastProvider>
      <Workbench />
      <ToastViewport />
    </ToastProvider>
  </ErrorBoundary>
);

const Workbench = () => {
  const { pushToast } = useToasts();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("timeline");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadRecordings().then((stored) => {
      setRecordings(stored);
      setActiveId(stored[0]?.id);
    });
  }, []);

  const activeRecording = useMemo(
    () => recordings.find((recording) => recording.id === activeId) ?? recordings[0],
    [activeId, recordings]
  );

  const importFiles = async (files: File[]) => {
    if (files.length === 0) {
      pushToast("info", "No audio files were selected.");
      return;
    }

    setBusy(true);
    const imported: Recording[] = [];
    const context = new AudioContext();
    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
        const analysis = await analyzeAudioBuffer(audioBuffer);
        const recording = recordingFromAnalysis(file.name, "imported", analysis);
        imported.push(recording);
        await saveRecording(recording, file);
      }
      setRecordings((current) => [...imported, ...current]);
      setActiveId(imported[0]?.id);
      pushToast(
        "success",
        `Imported ${imported.length} recording${imported.length === 1 ? "" : "s"}.`
      );
    } catch (error) {
      pushToast("error", error instanceof Error ? error.message : "Audio import failed.");
    } finally {
      await context.close();
      setBusy(false);
    }
  };

  const loadDemo = async () => {
    setBusy(true);
    try {
      const demo = createDemoCorpus();
      await saveRecordings(demo);
      setRecordings((current) => [
        ...demo,
        ...current.filter((recording) => recording.source !== "demo")
      ]);
      setActiveId(demo[0]?.id);
      pushToast("success", "Demo corpus generated locally.");
    } finally {
      setBusy(false);
    }
  };

  const updateRecording = async (updated: Recording) => {
    setRecordings((current) =>
      current.map((recording) => (recording.id === updated.id ? updated : recording))
    );
    await saveRecording(updated);
  };

  const removeRecording = async (id: string) => {
    await deleteRecording(id);
    setRecordings((current) => current.filter((recording) => recording.id !== id));
    if (activeId === id) {
      setActiveId(undefined);
    }
  };

  const clearAll = async () => {
    await clearRecordings();
    setRecordings([]);
    setActiveId(undefined);
    pushToast("success", "Local corpus cleared.");
  };

  return (
    <main className="app-shell">
      <Header />
      <DropZone busy={busy} onDemo={loadDemo} onFiles={importFiles} />
      <SummaryStrip recordings={recordings} />
      <section className="workspace">
        <CorpusList
          activeId={activeRecording?.id}
          onDelete={removeRecording}
          onSelect={setActiveId}
          recordings={recordings}
        />
        <div className="workspace-main">
          <div className="workspace-toolbar">
            <TabNav activeTab={activeTab} onChange={setActiveTab} />
            <button
              className="danger-button"
              disabled={recordings.length === 0}
              onClick={clearAll}
              type="button"
            >
              <Trash2 size={16} />
              Clear local corpus
            </button>
          </div>
          {activeTab === "timeline" ? (
            <TimelinePanel onUpdate={updateRecording} recording={activeRecording} />
          ) : null}
          {activeTab === "map" ? <GraphPanel recordings={recordings} /> : null}
          {activeTab === "score" ? <ScorePanel recording={activeRecording} /> : null}
          {activeTab === "stats" ? <StatsPanel recordings={recordings} /> : null}
          {activeTab === "engines" ? <EnginePanel recording={activeRecording} /> : null}
        </div>
      </section>
    </main>
  );
};
