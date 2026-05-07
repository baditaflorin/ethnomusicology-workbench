import { FileAudio, FlaskConical, Upload } from "lucide-react";
import { useRef, useState } from "react";

export const DropZone = ({
  busy,
  onDemo,
  onFiles
}: {
  busy: boolean;
  onDemo: () => void;
  onFiles: (files: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <section
      className={`drop-zone ${dragging ? "is-dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        onFiles([...event.dataTransfer.files].filter((file) => file.type.startsWith("audio/")));
      }}
    >
      <input
        accept="audio/*"
        hidden
        multiple
        onChange={(event) => onFiles([...(event.currentTarget.files ?? [])])}
        ref={inputRef}
        type="file"
      />
      <div className="drop-visual" aria-hidden="true">
        <FileAudio size={34} />
        <span />
        <span />
        <span />
      </div>
      <div>
        <h2>Drop field recordings</h2>
        <p>
          Decode local audio, transcribe melodic contours, detect scale/mode, build similarity maps,
          annotate timelines, and export research formats without uploading recordings.
        </p>
      </div>
      <div className="drop-actions">
        <button disabled={busy} onClick={() => inputRef.current?.click()} type="button">
          <Upload size={18} />
          Import audio
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={onDemo}
          type="button"
          data-testid="demo-corpus"
        >
          <FlaskConical size={18} />
          Demo corpus
        </button>
      </div>
    </section>
  );
};
