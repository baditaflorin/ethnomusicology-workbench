import type { Core, ElementDefinition } from "cytoscape";
import { useEffect, useMemo, useRef } from "react";
import { buildSimilarityEdges, clusterRecordings } from "@/features/corpus/clustering";
import { buildInfo } from "@/shared/buildInfo";
import { formatPercent } from "@/shared/format";
import type { Recording } from "@/types";

export const GraphPanel = ({ recordings }: { recordings: Recording[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const clusters = useMemo(() => clusterRecordings(recordings), [recordings]);
  const edges = useMemo(() => buildSimilarityEdges(recordings, 0.72), [recordings]);

  useEffect(() => {
    let graph: Core | undefined;
    let cancelled = false;

    const render = async () => {
      if (!containerRef.current || recordings.length === 0) {
        return;
      }
      const cytoscape = (await import("cytoscape")).default;
      if (cancelled || !containerRef.current) {
        return;
      }
      const elements: ElementDefinition[] = [
        ...recordings.map((recording) => ({
          data: {
            id: recording.id,
            label: recording.name.replace(/^Demo - /, ""),
            mode: `${recording.analysis.keyMode.tonic} ${recording.analysis.keyMode.mode}`
          }
        })),
        ...edges.map((edge) => ({
          data: {
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            weight: edge.similarity,
            label: `${Math.round(edge.similarity * 100)}%`
          }
        }))
      ];

      graph = cytoscape({
        container: containerRef.current,
        elements,
        layout: { name: "cose", animate: false, fit: true, padding: 24 },
        style: [
          {
            selector: "node",
            style: {
              "background-color": "#0f6b65",
              color: "#10201d",
              label: "data(label)",
              "font-size": "11px",
              "text-wrap": "wrap",
              "text-max-width": "120px",
              "text-valign": "bottom",
              "text-margin-y": 8,
              width: "34px",
              height: "34px",
              "border-width": "3px",
              "border-color": "#f4c95d"
            }
          },
          {
            selector: "edge",
            style: {
              width: "mapData(weight, 0.72, 1, 1, 7)",
              "line-color": "#7c556b",
              "target-arrow-color": "#7c556b",
              "curve-style": "bezier",
              opacity: 0.76,
              label: "data(label)",
              "font-size": "9px",
              color: "#4b3b43"
            }
          }
        ]
      });
    };

    void render();
    return () => {
      cancelled = true;
      graph?.destroy();
    };
  }, [edges, recordings]);

  return (
    <section className="panel work-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">similarity map</p>
          <h2>Corpus clusters</h2>
        </div>
        <a className="small-link" href={buildInfo.repoUrl} target="_blank" rel="noreferrer">
          GitHub repo
        </a>
      </div>
      <div className="graph-layout">
        <div className="graph-canvas" ref={containerRef} data-testid="corpus-map">
          {recordings.length === 0 ? <p>Add recordings to build the map.</p> : null}
        </div>
        <div className="cluster-list">
          {clusters.map((cluster) => (
            <div className="cluster-row" key={cluster.id}>
              <strong>{cluster.label}</strong>
              <span>{cluster.recordingIds.length} recordings</span>
            </div>
          ))}
          {edges.slice(0, 6).map((edge) => {
            const source = recordings.find((recording) => recording.id === edge.source);
            const target = recordings.find((recording) => recording.id === edge.target);
            return (
              <div className="edge-row" key={`${edge.source}-${edge.target}`}>
                <span>{source?.name ?? "source"}</span>
                <strong>{formatPercent(edge.similarity)}</strong>
                <span>{target?.name ?? "target"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
