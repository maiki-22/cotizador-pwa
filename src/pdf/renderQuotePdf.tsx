// src/pdf/renderQuotePdf.ts
import { pdf } from "@react-pdf/renderer";
import { QuoteDoc } from "./QuoteDoc";
import type { Quote, QuoteItem, Brand } from "../models";
import type { ItemType } from "../stores/quoteDraft";
import { savePdfToDb } from "../lib/db/pdfStore";

export async function buildAndDownloadQuotePdf(
  quote: Quote,
  items: (QuoteItem & { type?: ItemType; options?: any })[],
  brand: Brand
) {
  const instance = pdf(<QuoteDoc quote={quote} items={items} brand={brand} />);
  const blob = await instance.toBlob();

  // 👇 NUEVO: persistir en cache (IndexedDB) para el visor
  try {
    const ab = await blob.arrayBuffer();
    await savePdfToDb(quote.number, new Uint8Array(ab));
  } catch (e) {
    console.warn("No se pudo guardar el PDF en cache:", e);
  }

  const file = new File([blob], `${quote.number}.pdf`, {
    type: "application/pdf",
  });

  // Compartir si se puede, si no descargar
  const nav = navigator as Navigator & {
    canShare?: (d?: any) => boolean;
    share?: (d: any) => Promise<void>;
  };
  if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: `${quote.number}.pdf` });
      return;
    } catch {}
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${quote.number}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
