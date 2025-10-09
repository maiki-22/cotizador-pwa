import Dexie, { type Table } from "dexie";
import type { Quote, QuoteItem, Client } from "./models";

export class CotizadorDB extends Dexie {
  quotes!: Table<Quote, number>;
  items!: Table<QuoteItem, number>;
  clients!: Table<Client, number>;
  files!: Table<{ key: string; blob: Blob }, string>;

  constructor() {
    super("cotizador-db");

    // Versión 1 (original)
    this.version(1).stores({
      quotes:
        "++id, number, dateMillis, clientName, grandTotalCents, pdfBlobKey",
      items: "++id, quoteId, title",
      clients: "++id, name",
      files: "key",
    });

    // Versión 2 (agrega campos location, type, options a items)
    // No necesitas cambiar el schema de índices porque estos campos no se indexan
    this.version(2).stores({
      quotes:
        "++id, number, dateMillis, clientName, grandTotalCents, pdfBlobKey",
      items: "++id, quoteId, title", // mismo schema, Dexie guarda los campos JSON automáticamente
      clients: "++id, name",
      files: "key",
    });
  }
}

export const db = new CotizadorDB();

/** QUOTES */
export async function last10Quotes(): Promise<Quote[]> {
  return db.quotes.orderBy("dateMillis").reverse().limit(10).toArray();
}

export async function searchQuotes(q: string): Promise<Quote[]> {
  const s = q.toLowerCase();
  const arr = await db.quotes
    .filter(
      (r) =>
        r.number?.toLowerCase().includes(s) ||
        (r.clientName || "").toLowerCase().includes(s)
    )
    .toArray();
  return arr.sort((a, b) => b.dateMillis - a.dateMillis).slice(0, 50);
}

export async function insertQuote(q: Quote): Promise<number> {
  return db.quotes.add(q);
}

export async function insertItems(items: QuoteItem[]) {
  await db.items.bulkAdd(items);
}

export async function getQuoteWithItems(id: number) {
  const quote = await db.quotes.get(id);
  if (!quote) return null;
  const items = await db.items.where({ quoteId: id }).toArray();
  return { quote, items };
}

export async function setQuotePdfKey(number: string, key: string) {
  const q = await db.quotes.where({ number }).first();
  if (q?.id) await db.quotes.update(q.id, { pdfBlobKey: key });
}

// 👇 NUEVA FUNCIÓN - Eliminar cotización por número
export async function deleteQuote(quoteNumber: string): Promise<void> {
  const quote = await db.quotes.where({ number: quoteNumber }).first();
  if (!quote || !quote.id) {
    throw new Error("Cotización no encontrada");
  }

  // Eliminar todos los ítems asociados
  await db.items.where({ quoteId: quote.id }).delete();

  // Eliminar la cotización
  await db.quotes.delete(quote.id);

  // Opcional: eliminar el PDF del cache si existe
  if (quote.pdfBlobKey) {
    try {
      await db.files.delete(quote.pdfBlobKey);
    } catch (e) {
      console.warn("No se pudo eliminar el PDF en cache:", e);
    }
  }
}

/** STATISTICS */
export async function getQuotesStats(): Promise<{
  totalCount: number;
  totalValueCents: number;
}> {
  const allQuotes = await db.quotes.toArray();
  return {
    totalCount: allQuotes.length,
    totalValueCents: allQuotes.reduce(
      (acc, q) => acc + (q.grandTotalCents || 0),
      0
    ),
  };
}

/** CLIENTS */
export async function upsertClient(c: Client): Promise<number> {
  return c.id ? (await db.clients.put(c), c.id) : db.clients.add(c);
}

export async function listClients(): Promise<Client[]> {
  return db.clients.orderBy("name").toArray();
}

export async function searchClients(q: string): Promise<Client[]> {
  const s = q.toLowerCase();
  return db.clients
    .filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.email ?? "").toLowerCase().includes(s)
    )
    .toArray();
}

export async function insertClient(c: Omit<Client, "id">): Promise<number> {
  return db.clients.add(c);
}

export async function deleteClient(id: number): Promise<void> {
  await db.clients.delete(id);
}

/** FILES (PDF) */
export async function upsertPdfBlob(key: string, blob: Blob) {
  await db.files.put({ key, blob });
}

export async function getPdfBlob(key: string) {
  const rec = await db.files.get(key);
  return rec?.blob;
}
