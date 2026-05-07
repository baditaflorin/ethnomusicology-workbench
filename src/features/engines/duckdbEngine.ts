import type { Recording } from "@/types";

export const runDuckDbSummary = async (recordings: Recording[]): Promise<string> => {
  const duckdb = await import("@duckdb/duckdb-wasm");
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], { type: "text/javascript" })
  );
  const worker = new Worker(workerUrl);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  const connection = await db.connect();
  const rows = recordings.map((recording) => ({
    id: recording.id,
    name: recording.name,
    duration: recording.duration,
    mode: `${recording.analysis.keyMode.tonic} ${recording.analysis.keyMode.mode}`,
    tempo: recording.analysis.tempoEstimate,
    notes: recording.analysis.notes.length,
    centroid: recording.analysis.spectralCentroid
  }));
  await db.registerFileText("corpus.json", JSON.stringify(rows));
  const result = await connection.query(`
    SELECT
      count(*)::INTEGER AS recordings,
      round(avg(duration), 3) AS avg_duration,
      round(avg(tempo), 2) AS avg_tempo,
      mode,
      count(*)::INTEGER AS mode_count
    FROM read_json_auto('corpus.json')
    GROUP BY mode
    ORDER BY mode_count DESC, mode
  `);
  await connection.close();
  await db.terminate();
  worker.terminate();
  URL.revokeObjectURL(workerUrl);
  return result.toString();
};
