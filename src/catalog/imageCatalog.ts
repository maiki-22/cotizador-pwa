// src/catalog/imageCatalog.ts
import type { ItemType, ItemOptions } from "../stores/quoteDraft";

// 🧭 Helper: respeta el base path de GH Pages
const withBase = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, "");

// Carga build-safe de imágenes (Vite). Si no encuentra en src/, cae a /public/images.
const FILES = import.meta.glob("../images/**/*.{png,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

// ⚠️ IMPORTANTE: el fallback debe respetar el base en GH Pages
const fallbackPublic = (dir: string, file?: string) =>
  file ? withBase(`images/${dir}/${file}`) : undefined;

function lookup(dir: string, file?: string) {
  if (!file) return undefined;
  const key = Object.keys(FILES).find((k) =>
    k.replace(/\\/g, "/").endsWith(`/images/${dir}/${file}`)
  );
  // Si existe en src/, FILES[key] ya trae el base correcto; si no, usamos /public con BASE_URL
  return key ? FILES[key] : fallbackPublic(dir, file);
}

// Directorios por tipo (sin normalización de nombres)
export const DIR_BY_TYPE: Record<ItemType, string> = {
  ventana_fija_42: "ventana-fija-42",
  ventana_proyectante_42: "ventana-proyectante-42",
  ventana_corredera_20: "corredera-20",
  ventana_corredera_25: "corredera-25",
  bow_windows: "bow-windows",
  tabiqueria: "tabiqueria",
  tabiqueria_banho: "tabiqueria-bano",
  muro_cortina: "muro-cortina",
  puerta: "puerta",
  shower: "shower",
};

function materialFile(m?: ItemOptions["material"]) {
  const s = (m ?? "").toLowerCase();
  if (s.includes("madera")) return "pvc-madera.png";
  if (s.includes("blanco")) return "pvc-blanco.png";
  if (s.includes("aluminio")) return "aluminio.png";
    // Aluminio base y variantes por serie usan la misma imagen
  if (s.includes("aluminio") || s.includes("alumino")) return "aluminio.png";

  return undefined;
}

// Resolver ÚNICO (úsalo en UI y PDF)
export function imageFor(type: ItemType, opts: ItemOptions = {}) {
  const dir = DIR_BY_TYPE[type];
  if (!dir) return undefined;

  // Shower: color de perfilería
  if (type === "shower") {
    const c = (opts.showerFrameColor ?? "").toLowerCase(); // gris/negro/blanco
    const name =
      c === "gris"
        ? "aluminio.png"
        : c === "negro"
        ? "aluminio.png"
        : "aluminio.png";
    return lookup(dir, name);
  }

  // Muro cortina: vidrio / alucobond
  if (type === "muro_cortina") {
    const t = (opts.curtainWallType ?? "").toLowerCase();
    const name = t === "alucobond" ? "vidrio.png" : "vidrio.png";
    return lookup(dir, name);
  }

  // Tabiquería baño: vidrio / melamina / alucobond
  if (type === "tabiqueria_banho") {
    const p = (opts.panelType ?? "").toLowerCase();
    const name =
      p === "vidrio"
        ? "aluminio.png"
        : p === "melamina"
        ? "aluminio.png" // si no existe en /images, caerá al fallback
        : p === "alucobond"
        ? "aluminio.png"
        : "aluminio.png";
    return lookup(dir, name);
  }

  // Tabiquería simple
  if (type === "tabiqueria") {
    return lookup(dir, "aluminio.png");
  }

  // Resto (ventanas/puertas/bow): por material
  return lookup(dir, materialFile(opts.material));
}

// Aliases para mantener imports existentes
export const imageForItem = imageFor;
export const imageForQuote = imageFor;
