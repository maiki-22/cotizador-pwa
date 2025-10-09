export type Brand = {
  COMPANY_NAME: string;
  COMPANY_EMAIL?: string;
  COMPANY_PHONE?: string;
  COMPANY_RUT?: string;
  COMPANY_ADDRESS?: string; // Agregar esta línea
  IVA_PERCENT: number;
  CONDITIONS?: string[];
};

export interface QuoteEntity {
  id?: number;
  number: string;
  dateMillis: number;
  clientId?: number | null;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  netTotalCents: number;
  ivaCents: number;
  grandTotalCents: number;
  pdfBlobKey?: string | null; // clave para recuperar el PDF en IndexedDB
}

export interface QuoteItemEntity {
  id?: number;
  quoteId: number;
  title: string;
  quantity?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  unitPriceCents: number;
  subtotalCents: number;
  // Campos adicionales para el PDF
  location?: string | null;
  type?: string | null;
  options?: Record<string, any> | null;
}

export type QuoteWithItems = {
  quote: QuoteEntity;
  items: QuoteItemEntity[];
};

export type Quote = {
  id?: number;
  number: string;
  dateMillis: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  netTotalCents: number;
  ivaCents: number;
  grandTotalCents: number;
  pdfBlobKey?: string;
};

export interface QuoteItem {
  id?: number;
  quoteId: number;
  title: string;
  widthMm?: number;
  heightMm?: number;
  quantity?: number;
  unitPriceCents?: number;
  subtotalCents?: number;

  // ✅ añade estos (opcionales) para el PDF
  type?: string; // ej. "ventana_fija_42"
  options?: any; // { material, glassType, glassColor, ... }
  location?: string;
}

export type Client = {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type QuoteDraft = {
  clientId?: number | null; // si selecciona un cliente existente
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  persistClient: boolean; // “Guardar cliente” checkbox
  items: QuoteItemDraft[];
};

import type { ItemType, ItemOptions } from "./stores/quoteDraft";

export type QuoteItemDraft = {
  tempId: string;
  type: ItemType; // tipo del catálogo
  title: string; // descripción visible (puede formarse con opciones)
  widthMm?: number;
  heightMm?: number;
  quantity?: number; // unidades
  unitPriceCents?: number; // precio unitario
  subtotalCents?: number; // calculado: qty * unit
  location?: string; // texto libre (ej: dormitorio, cocina, etc.)
  options: ItemOptions; // opciones específicas
  photosKeys: string[];
};

export type Totals = {
  netTotalCents: number;
  ivaCents: number;
  grandTotalCents: number;
};

export const calcTotals = (
  items: { subtotalCents?: number }[],
  iva: number
) => {
  const net = items.reduce((acc, it) => acc + (it.subtotalCents ?? 0), 0);
  const ivaCents = Math.round((net * iva) / 100);
  return { netTotalCents: net, ivaCents, grandTotalCents: net + ivaCents };
};

export const genNumber = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
    d.getDate()
  )}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `COT-${stamp}`;
};
