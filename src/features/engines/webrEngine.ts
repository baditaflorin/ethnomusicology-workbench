import type { Recording } from "@/types";

type WebRModule = {
  WebR: new () => {
    init: () => Promise<void>;
    evalRString: (code: string) => Promise<{ toString: () => string }>;
    close: () => void;
  };
};

const importWebR = async (): Promise<WebRModule> => {
  const importer = new Function("specifier", "return import(specifier)") as (
    specifier: string
  ) => Promise<WebRModule>;
  return importer("https://webr.r-wasm.org/latest/webr.mjs");
};

export const runWebRSummary = async (recordings: Recording[]): Promise<string> => {
  const durations = recordings.map((recording) => recording.duration.toFixed(4)).join(",");
  const tempos = recordings
    .map((recording) => recording.analysis.tempoEstimate.toFixed(4))
    .join(",");
  const module = await importWebR();
  const webR = new module.WebR();
  await webR.init();
  const output = await webR.evalRString(`
    durations <- c(${durations || "0"})
    tempos <- c(${tempos || "0"})
    paste(
      "R summary:",
      paste("n=", length(durations)),
      paste("duration_mean=", round(mean(durations), 3)),
      paste("tempo_mean=", round(mean(tempos), 2)),
      paste("duration_sd=", round(stats::sd(durations), 3)),
      sep="\\n"
    )
  `);
  const text = output.toString();
  webR.close();
  return text;
};
