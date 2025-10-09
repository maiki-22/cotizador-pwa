import Dexie from "dexie";
import type { Table } from "dexie";

type FileRec = { key: string; blob: Blob };

class FileDB extends Dexie {
  files!: Table<FileRec, string>;
  constructor() {
    super("cotizador-files");
    this.version(1).stores({
      files: "key", // índice por clave
    });
  }
}

const db = new FileDB();

/** Guarda un blob (File/Blob) con una clave */
export async function putImageBlob(
  key: string,
  file: Blob | File
): Promise<void> {
  await db.files.put({ key, blob: file });
}

/** Lee el blob crudo desde IndexedDB */
export async function getImageBlob(key: string): Promise<Blob | undefined> {
  const rec = await db.files.get(key);
  return rec?.blob;
}

/** Devuelve un ObjectURL para mostrar en <img>, o undefined si no existe */
export async function getImageObjectUrl(
  key: string
): Promise<string | undefined> {
  const blob = await getImageBlob(key);
  if (!blob) return undefined;
  return URL.createObjectURL(blob);
}

/** Borra una imagen por clave (opcional) */
export async function deleteImageBlob(key: string): Promise<void> {
  await db.files.delete(key);
}

/** Libera un ObjectURL cuando ya no lo uses */
export function revokeObjectUrl(url: string) {
  URL.revokeObjectURL(url);
}
