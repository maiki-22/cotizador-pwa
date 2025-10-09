// src/stores/quoteDraft.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { putImageBlob } from "../lib/db/fileStore";

// ---- Tipos de ítem admitidos (carrito) ----
export type ItemType =
  | "ventana_fija_42"
  | "ventana_proyectante_42"
  | "ventana_corredera_20"
  | "ventana_corredera_25"
  | "bow_windows"
  | "tabiqueria"
  | "tabiqueria_banho"
  | "muro_cortina"
  | "puerta"
  | "shower";

// Campos de opciones posibles (según el tipo se mostrarán algunas)
export type ItemOptions = {
  // comunes a muchas ventanas/puertas/tabiquería
  material?: "PVC Blanco" | "PVC Madera" | "Aluminio";
  glassType?: "Templado" | "Termopanel" | "Simple" | "Laminado";
  glassColor?: "incoloro" | "verde" | "gris" | "bronce";

  // Shower
  showerFrameColor?: "Gris" | "Negro" | "Blanco";
  showerType?: "Acrílico" | "Vidrio laminado";

  // Muro Cortina / Tabiquería Baño (tipo de panel)
  panelType?: "Vidrio" | "Melamina" | "Alucobond"; // baño
  curtainWallType?: "Vidrio" | "Alucobond"; // muro cortina
};

export interface QuoteItemDraft {
  tempId: string; // id temporal (carrito)
  type: ItemType; // tipo de producto
  title: string; // título visible
  widthMm?: number;
  heightMm?: number;
  quantity?: number; // puede ser decimal
  unitPriceCents?: number; // CLP en centavos
  subtotalCents?: number; // quantity * unitPriceCents
  location?: string; // cocina, dormitorio, etc.
  options?: ItemOptions; // valores de selects
  photosKeys: string[]; // (compat) claves en IndexedDB para fotos
}

type ClientCompat =
  | {
      kind: "existing";
      id: number;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    }
  | {
      kind: "inline";
      persist: boolean;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };

export interface QuoteDraftState {
  // Datos de cliente “plano”
  clientId?: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  saveClientToBook: boolean;

  // Derivado de compatibilidad (lo usan algunas pantallas)
  client?: ClientCompat;

  // Ítems del borrador (carrito)
  items: QuoteItemDraft[];

  // ---- Acciones base
  reset(): void;

  setClient(
    data: Partial<
      Pick<
        QuoteDraftState,
        | "clientId"
        | "clientName"
        | "clientEmail"
        | "clientPhone"
        | "clientAddress"
      >
    >
  ): void;

  setSaveClientToBook(flag: boolean): void;

  // Crea un ítem y devuelve su tempId
  startNewItem(type: ItemType): string;

  // Actualiza un ítem existente (recalcula subtotal si procede)
  updateItem(tempId: string, patch: Partial<QuoteItemDraft>): void;

  // Quita un ítem
  removeItem(tempId: string): void;

  // (Compat) Adjuntar fotos locales a IndexedDB
  attachPhotos(tempId: string, files: FileList | File[]): Promise<void>;
  removePhoto(tempId: string, key: string): void;

  // ---- Alias de compatibilidad con tu UI
  addPhotos(tempId: string, files: FileList | File[]): Promise<void>;
  newItem(type: ItemType): string;

  // Acepta (tempId, patch) o bien (patchConTempId)
  addOrUpdateItem(tempId: string, patch: Partial<QuoteItemDraft>): void;
  addOrUpdateItem(
    patchWithId: Partial<QuoteItemDraft> & { tempId: string }
  ): void;

  clearAll(): void;

  setExistingClient(c: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }): void;

  setInlineClient(
    c: { name: string; email?: string; phone?: string; address?: string },
    saveToBook: boolean
  ): void;
}

const defaultTitleByType: Record<ItemType, string> = {
  ventana_fija_42: "Ventana Fija",
  ventana_proyectante_42: "Ventana Proyectante",
  ventana_corredera_20: "Ventana Corredera serie 20",
  ventana_corredera_25: "Ventana Corredera serie 25",
  bow_windows: "Bow Windows",
  tabiqueria: "Tabiquería",
  tabiqueria_banho: "Tabiquería Baño",
  muro_cortina: "Muro Cortina",
  puerta: "Puerta",
  shower: "Shower",
};

// Generador de ids temporales robusto
function makeTempId(prefix = "it"): string {
  const id =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}`;
}

// Recalcula subtotal de forma segura
function calcSubtotal(qty?: number, unit?: number): number {
  const q = Number.isFinite(qty) ? (qty as number) : 0;
  const u = Number.isFinite(unit) ? (unit as number) : 0;
  return Math.round(q * u);
}

export const useQuoteDraft = create<QuoteDraftState>()(
  persist(
    (set, get) => ({
      clientId: undefined,
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      saveClientToBook: true,

      // Construimos client derivado para compatibilidad
      get client() {
        const s = get();
        if (s.clientId) {
          return {
            kind: "existing",
            id: s.clientId,
            name: s.clientName ?? "",
            email: s.clientEmail,
            phone: s.clientPhone,
            address: s.clientAddress,
          } as ClientCompat;
        }
        if ((s.clientName ?? "").trim()) {
          return {
            kind: "inline",
            persist: !!s.saveClientToBook,
            name: s.clientName ?? "",
            email: s.clientEmail,
            phone: s.clientPhone,
            address: s.clientAddress,
          } as ClientCompat;
        }
        return undefined;
      },

      items: [],

      reset() {
        set({
          clientId: undefined,
          clientName: "",
          clientEmail: "",
          clientPhone: "",
          clientAddress: "",
          saveClientToBook: true,
          items: [],
        });
      },

      setClient(data) {
        set((s) => ({ ...s, ...data }));
      },

      setSaveClientToBook(flag: boolean) {
        set({ saveClientToBook: flag });
      },

      startNewItem(type: ItemType) {
        const tempId = makeTempId();
        const draft: QuoteItemDraft = {
          tempId,
          type,
          title: defaultTitleByType[type],
          quantity: 1,
          unitPriceCents: 0,
          subtotalCents: 0,
          options: {},
          photosKeys: [],
        };
        set((s) => ({ items: [...s.items, draft] }));
        return tempId;
      },

      updateItem(tempId: string, patch: Partial<QuoteItemDraft>) {
        set((s) => {
          const items = s.items.map((it) => {
            if (it.tempId !== tempId) return it;
            const next: QuoteItemDraft = {
              ...it,
              ...patch,
              options: { ...(it.options ?? {}), ...(patch.options ?? {}) },
              photosKeys: [...(it.photosKeys ?? [])],
            };
            // Recalcular subtotal si corresponde
            if (
              typeof patch.quantity !== "undefined" ||
              typeof patch.unitPriceCents !== "undefined" ||
              typeof next.subtotalCents !== "number"
            ) {
              next.subtotalCents = calcSubtotal(
                next.quantity,
                next.unitPriceCents
              );
            }
            return next;
          });
          return { items };
        });
      },

      removeItem(tempId: string) {
        set((s) => ({ items: s.items.filter((it) => it.tempId !== tempId) }));
      },

      async attachPhotos(tempId: string, files: FileList | File[]) {
        const arr: File[] =
          files instanceof FileList ? Array.from(files) : files;
        const newKeys: string[] = [];
        for (let i = 0; i < arr.length; i++) {
          const f = arr[i];
          const key = `itm-${tempId}-${Date.now()}-${i}`;
          await putImageBlob(key, f); // guarda en IndexedDB
          newKeys.push(key);
        }
        set((s) => ({
          items: s.items.map((it) =>
            it.tempId === tempId
              ? { ...it, photosKeys: [...(it.photosKeys ?? []), ...newKeys] }
              : it
          ),
        }));
      },

      removePhoto(tempId: string, key: string) {
        set((s) => ({
          items: s.items.map((it) =>
            it.tempId === tempId
              ? {
                  ...it,
                  photosKeys: (it.photosKeys ?? []).filter((k) => k !== key),
                }
              : it
          ),
        }));
      },

      // ===== ALIAS =====
      addPhotos(tempId: string, files: FileList | File[]) {
        return get().attachPhotos(tempId, files);
      },

      newItem(type: ItemType) {
        return get().startNewItem(type);
      },

      // Sobrecarga: (tempId, patch) o ({tempId, ...patch})
      addOrUpdateItem(
        a: string | (Partial<QuoteItemDraft> & { tempId: string }),
        b?: Partial<QuoteItemDraft>
      ) {
        if (typeof a === "string") {
          get().updateItem(a, b ?? {});
        } else {
          get().updateItem(a.tempId, a);
        }
      },

      clearAll() {
        get().reset();
      },

      setExistingClient(c) {
        set({
          clientId: c.id,
          clientName: c.name,
          clientEmail: c.email ?? "",
          clientPhone: c.phone ?? "",
          clientAddress: c.address ?? "",
          saveClientToBook: true,
        });
      },

      setInlineClient(c, saveToBook) {
        set({
          clientId: undefined,
          clientName: c.name,
          clientEmail: c.email ?? "",
          clientPhone: c.phone ?? "",
          clientAddress: c.address ?? "",
          saveClientToBook: !!saveToBook,
        });
      },
    }),
    {
      name: "cotizador-quote-draft",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
