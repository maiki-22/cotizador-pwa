import { get, set, del, keys } from "idb-keyval";

const PREFIX = "pdf:quote:"; // clave = pdf:quote:<quote.number>

export async function savePdfToDb(quoteNumber: string, bytes: Uint8Array) {
  await set(PREFIX + quoteNumber, bytes);
}

export async function getPdfFromDb(
  quoteNumber: string
): Promise<Uint8Array | undefined> {
  return (await get(PREFIX + quoteNumber)) as Uint8Array | undefined;
}

export async function deletePdf(quoteNumber: string) {
  await del(PREFIX + quoteNumber);
}

export async function listStoredPdfs(): Promise<string[]> {
  const allKeys = (await keys()) as string[];
  return allKeys
    .filter((k) => typeof k === "string" && k.startsWith(PREFIX))
    .map((k) => k.slice(PREFIX.length));
}
