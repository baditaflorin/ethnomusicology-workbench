import type { Recording } from "@/types";

type TranscriptResult = {
  text: string;
  engine: string;
};

export const runLocalWhisperProbe = async (recording: Recording): Promise<TranscriptResult> => {
  const importer = new Function("specifier", "return import(specifier)") as (
    specifier: string
  ) => Promise<{
    env?: { allowLocalModels?: boolean };
  }>;
  const transformers = await importer(
    "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js"
  );

  if (transformers.env) {
    transformers.env.allowLocalModels = false;
  }

  return {
    engine: "Transformers.js Whisper adapter",
    text: `Whisper adapter loaded for ${recording.name}. Full speech transcription requires model download and an audio blob cache; the v1 musical transcription is already available in the timeline.`
  };
};
