import { openDB, type DBSchema } from "idb";
import type { Recording } from "@/types";

type StoredRecording = Recording & {
  audioBlob?: Blob;
};

interface WorkbenchDb extends DBSchema {
  recordings: {
    key: string;
    value: StoredRecording;
    indexes: {
      "by-created": string;
    };
  };
}

const DB_NAME = "ethnomusicology-workbench";
const DB_VERSION = 1;

const dbPromise = openDB<WorkbenchDb>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const store = db.createObjectStore("recordings", { keyPath: "id" });
    store.createIndex("by-created", "createdAt");
  }
});

export const loadRecordings = async (): Promise<Recording[]> => {
  const db = await dbPromise;
  const records = await db.getAllFromIndex("recordings", "by-created");
  return records
    .map((record) => {
      const recording: Partial<StoredRecording> = { ...record };
      delete recording.audioBlob;
      return recording as Recording;
    })
    .reverse();
};

export const saveRecording = async (recording: Recording, audioBlob?: Blob): Promise<void> => {
  const db = await dbPromise;
  const existing = await db.get("recordings", recording.id);
  await db.put("recordings", {
    ...recording,
    audioBlob: audioBlob ?? existing?.audioBlob
  });
};

export const saveRecordings = async (recordings: Recording[]): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction("recordings", "readwrite");
  await Promise.all(recordings.map((recording) => tx.store.put(recording)));
  await tx.done;
};

export const deleteRecording = async (id: string): Promise<void> => {
  const db = await dbPromise;
  await db.delete("recordings", id);
};

export const clearRecordings = async (): Promise<void> => {
  const db = await dbPromise;
  await db.clear("recordings");
};
