import type { Annotation, Recording, TranscribedNote } from "@/types";

export type ExportArtifact = {
  filename: string;
  mime: string;
  content: string;
};

export const exportRecordingJson = (recording: Recording): ExportArtifact => ({
  filename: `${safeName(recording.name)}.analysis.json`,
  mime: "application/json",
  content: JSON.stringify(recording, null, 2)
});

export const exportCorpusCsv = (recordings: Recording[]): ExportArtifact => {
  const rows = [
    [
      "id",
      "name",
      "duration",
      "sample_rate",
      "channels",
      "tonic",
      "mode",
      "mode_confidence",
      "tempo_estimate",
      "spectral_centroid",
      "rms",
      "notes",
      "annotations"
    ],
    ...recordings.map((recording) => [
      recording.id,
      recording.name,
      recording.duration.toFixed(3),
      String(recording.sampleRate),
      String(recording.channels),
      recording.analysis.keyMode.tonic,
      recording.analysis.keyMode.mode,
      recording.analysis.keyMode.confidence.toFixed(3),
      String(recording.analysis.tempoEstimate),
      recording.analysis.spectralCentroid.toFixed(2),
      recording.analysis.rms.toFixed(5),
      String(recording.analysis.notes.length),
      String(recording.annotations.length)
    ])
  ];

  return {
    filename: "corpus-analysis.csv",
    mime: "text/csv",
    content: rows.map((row) => row.map(csvCell).join(",")).join("\n")
  };
};

export const exportElanEaf = (recording: Recording): ExportArtifact => {
  const timeSlots = buildTimeSlots(recording);
  const annotations = [
    ...recording.analysis.timeline.map(
      (segment): Annotation => ({
        id: segment.id,
        tier: "performance",
        start: segment.start,
        end: segment.end,
        value: segment.label,
        createdAt: recording.analysis.generatedAt
      })
    ),
    ...recording.annotations
  ];

  const tiers = groupBy(annotations, (annotation) => annotation.tier);
  const tierXml = [...tiers.entries()]
    .map(
      ([tier, tierAnnotations]) => `
  <TIER TIER_ID="${escapeXml(tier)}" LINGUISTIC_TYPE_REF="default-lt">
${tierAnnotations
  .map((annotation, index) => {
    const start = timeSlots.get(slotKey(annotation.start));
    const end = timeSlots.get(slotKey(annotation.end));
    return `    <ANNOTATION>
      <ALIGNABLE_ANNOTATION ANNOTATION_ID="${escapeXml(`${tier}-${index + 1}`)}" TIME_SLOT_REF1="${start}" TIME_SLOT_REF2="${end}">
        <ANNOTATION_VALUE>${escapeXml(annotation.value)}</ANNOTATION_VALUE>
      </ALIGNABLE_ANNOTATION>
    </ANNOTATION>`;
  })
  .join("\n")}
  </TIER>`
    )
    .join("\n");

  const timeXml = [...timeSlots.entries()]
    .map(
      ([seconds, id]) =>
        `    <TIME_SLOT TIME_SLOT_ID="${id}" TIME_VALUE="${Math.max(0, Math.round(Number(seconds) * 1000))}" />`
    )
    .join("\n");

  return {
    filename: `${safeName(recording.name)}.eaf`,
    mime: "application/xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<ANNOTATION_DOCUMENT AUTHOR="Ethnomusicology Workbench" DATE="${recording.analysis.generatedAt}" FORMAT="3.0" VERSION="3.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <HEADER MEDIA_FILE="" TIME_UNITS="milliseconds">
    <PROPERTY NAME="source">${escapeXml(recording.name)}</PROPERTY>
  </HEADER>
  <TIME_ORDER>
${timeXml}
  </TIME_ORDER>
${tierXml}
  <LINGUISTIC_TYPE LINGUISTIC_TYPE_ID="default-lt" TIME_ALIGNABLE="true" />
</ANNOTATION_DOCUMENT>
`
  };
};

export const exportPraatTextGrid = (recording: Recording): ExportArtifact => {
  const annotations = recording.annotations.length
    ? recording.annotations
    : recording.analysis.timeline.map(
        (segment): Annotation => ({
          id: segment.id,
          tier: "performance",
          start: segment.start,
          end: segment.end,
          value: segment.label,
          createdAt: recording.analysis.generatedAt
        })
      );
  const tiers = [...groupBy(annotations, (annotation) => annotation.tier).entries()];

  return {
    filename: `${safeName(recording.name)}.TextGrid`,
    mime: "text/plain",
    content: `File type = "ooTextFile"
Object class = "TextGrid"

xmin = 0
xmax = ${recording.duration.toFixed(3)}
tiers? <exists>
size = ${tiers.length}
item []:
${tiers
  .map(
    ([tier, tierAnnotations], tierIndex) => `    item [${tierIndex + 1}]:
        class = "IntervalTier"
        name = "${escapeTextGrid(tier)}"
        xmin = 0
        xmax = ${recording.duration.toFixed(3)}
        intervals: size = ${tierAnnotations.length}
${tierAnnotations
  .map(
    (annotation, annotationIndex) => `        intervals [${annotationIndex + 1}]:
            xmin = ${annotation.start.toFixed(3)}
            xmax = ${annotation.end.toFixed(3)}
            text = "${escapeTextGrid(annotation.value)}"`
  )
  .join("\n")}`
  )
  .join("\n")}
`
  };
};

export const exportMusicXml = (recording: Recording): ExportArtifact => ({
  filename: `${safeName(recording.name)}.musicxml`,
  mime: "application/vnd.recordare.musicxml+xml",
  content: `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work><work-title>${escapeXml(recording.name)}</work-title></work>
  <identification><creator type="software">Ethnomusicology Workbench</creator></identification>
  <part-list>
    <score-part id="P1"><part-name>Transcription</part-name></score-part>
  </part-list>
  <part id="P1">
${musicXmlMeasures(recording.analysis.notes)}
  </part>
</score-partwise>
`
});

export const exportLilyPond = (recording: Recording): ExportArtifact => ({
  filename: `${safeName(recording.name)}.ly`,
  mime: "text/x-lilypond",
  content: `\\version "2.24.0"
\\header {
  title = "${escapeLily(recording.name)}"
  subtitle = "${escapeLily(`${recording.analysis.keyMode.tonic} ${recording.analysis.keyMode.mode}`)}"
  tagline = "Generated locally by Ethnomusicology Workbench"
}

melody = \\relative c' {
  \\tempo 4 = ${Math.max(40, recording.analysis.tempoEstimate || 80)}
  ${recording.analysis.notes.map(lilyNote).join(" ")}
}

\\score {
  \\new Staff \\melody
  \\layout { }
}
`
});

export const downloadArtifact = (artifact: ExportArtifact): void => {
  const blob = new Blob([artifact.content], { type: artifact.mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = artifact.filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const buildTimeSlots = (recording: Recording): Map<string, string> => {
  const values = new Set<number>([0, recording.duration]);
  recording.analysis.timeline.forEach((segment) => {
    values.add(segment.start);
    values.add(segment.end);
  });
  recording.annotations.forEach((annotation) => {
    values.add(annotation.start);
    values.add(annotation.end);
  });
  return new Map(
    [...values].sort((a, b) => a - b).map((seconds, index) => [slotKey(seconds), `ts${index + 1}`])
  );
};

const musicXmlMeasures = (notes: TranscribedNote[]): string => {
  const measures: string[] = [];
  const chunkSize = 8;
  const chunks = chunk(notes.length ? notes : [restNote()], chunkSize);
  chunks.forEach((measureNotes, index) => {
    const attributes =
      index === 0
        ? `      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>`
        : "";
    measures.push(`    <measure number="${index + 1}">
${attributes}
${measureNotes.map(musicXmlNote).join("\n")}
    </measure>`);
  });
  return measures.join("\n");
};

const musicXmlNote = (note: TranscribedNote): string => {
  if (note.midi < 0) {
    return `      <note><rest/><duration>4</duration><type>quarter</type></note>`;
  }
  const step = note.name.replace("#", "").replace("b", "");
  const alter = note.name.includes("#") ? 1 : note.name.includes("b") ? -1 : 0;
  return `      <note>
        <pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ""}<octave>${note.octave}</octave></pitch>
        <duration>${durationDivisions(note.duration)}</duration>
        <type>${durationType(note.duration)}</type>
      </note>`;
};

const lilyNote = (note: TranscribedNote): string => {
  const base = note.name
    .toLowerCase()
    .replace("#", "is")
    .replace("eb", "ees")
    .replace("ab", "aes")
    .replace("bb", "bes");
  const octaveMark = note.octave >= 4 ? "'".repeat(note.octave - 3) : ",".repeat(4 - note.octave);
  return `${base}${octaveMark}${lilyDuration(note.duration)}`;
};

const restNote = (): TranscribedNote => ({
  id: "rest",
  start: 0,
  end: 1,
  duration: 1,
  midi: -1,
  frequency: 0,
  name: "C",
  octave: 4,
  confidence: 0
});

const durationDivisions = (duration: number): number => {
  if (duration >= 1.5) {
    return 8;
  }
  if (duration >= 0.75) {
    return 4;
  }
  if (duration >= 0.35) {
    return 2;
  }
  return 1;
};

const durationType = (duration: number): string => {
  if (duration >= 1.5) {
    return "half";
  }
  if (duration >= 0.75) {
    return "quarter";
  }
  if (duration >= 0.35) {
    return "eighth";
  }
  return "16th";
};

const lilyDuration = (duration: number): string => {
  if (duration >= 1.5) {
    return "2";
  }
  if (duration >= 0.75) {
    return "4";
  }
  if (duration >= 0.35) {
    return "8";
  }
  return "16";
};

const chunk = <T>(values: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) {
    chunks.push(values.slice(i, i + size));
  }
  return chunks;
};

const groupBy = <T>(values: T[], key: (value: T) => string): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  values.forEach((value) => {
    const groupKey = key(value);
    groups.set(groupKey, [...(groups.get(groupKey) ?? []), value]);
  });
  return groups;
};

const safeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const slotKey = (seconds: number): string => seconds.toFixed(3);

const csvCell = (value: string): string => `"${value.replaceAll('"', '""')}"`;

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const escapeTextGrid = (value: string): string => value.replaceAll('"', '""');

const escapeLily = (value: string): string => value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
