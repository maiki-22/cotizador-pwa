import type { ItemType, ItemOptions } from "../stores/quoteDraft";

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  ventana_fija_42: "Ventana Fija",
  ventana_proyectante_42: "Ventana Proyectante",
  ventana_corredera_20: "Ventana Corredera serie 20",
  ventana_corredera_25: "Ventana Corredera serie 25",
  bow_windows: "Bow Windows",
  tabiqueria: "Tabiquería",
  tabiqueria_banho: "Tabiquería de baño",
  muro_cortina: "Muro Cortina",
  puerta: "Puerta",
  shower: "Shower",
};

export type ItemConfig = {
  // qué selects mostrar
  showMaterial?: boolean;
  showGlassType?: boolean;
  showGlassColor?: boolean;
  showShowerFrameColor?: boolean;
  showShowerType?: boolean;
  showPanelType?: boolean; // Tabiquería baño
  showCurtainWallType?: boolean; // Muro cortina

  // opciones
  materialOptions?: Array<ItemOptions["material"]>;
  glassTypeOptions?: Array<ItemOptions["glassType"]>;
  glassColorOptions?: Array<ItemOptions["glassColor"]>;
  showerFrameColorOptions?: Array<ItemOptions["showerFrameColor"]>;
  showerTypeOptions?: Array<ItemOptions["showerType"]>;
  panelTypeOptions?: Array<ItemOptions["panelType"]>;
  curtainWallTypeOptions?: Array<ItemOptions["curtainWallType"]>;

  // condiciones para campos dependientes
  enableGlassOnlyIf?: (opts: ItemOptions) => boolean;
  enableGlassColorOnlyIf?: (opts: ItemOptions) => boolean;
};

const MAT_PVC = ["PVC Blanco", "PVC Madera"] as const;
const MAT_PVC_ALU = ["PVC Blanco", "PVC Madera", "Aluminio"] as const;
const MAT_ALU = ["Aluminio"] as const;

const GLASS_TYPES = ["Templado", "Termopanel", "Simple", "Laminado"] as const;
const GLASS_COLORS = ["incoloro", "verde", "gris", "bronce"] as const;

export const ITEM_CATALOG: Record<ItemType, ItemConfig> = {
  ventana_fija_42: {
    showMaterial: true,
    materialOptions: [...MAT_PVC],
    showGlassType: true,
    glassTypeOptions: [...GLASS_TYPES],
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
  },
  ventana_proyectante_42: {
    showMaterial: true,
    materialOptions: [...MAT_PVC],
    showGlassType: true,
    glassTypeOptions: [...GLASS_TYPES],
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
  },
  ventana_corredera_20: {
    showMaterial: true,
    materialOptions: [...MAT_PVC],
    showGlassType: true,
    glassTypeOptions: [...GLASS_TYPES],
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
  },
  ventana_corredera_25: {
    showMaterial: true,
    materialOptions: [...MAT_PVC],
    showGlassType: true,
    glassTypeOptions: [...GLASS_TYPES],
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
  },
  bow_windows: {
    showMaterial: true,
    materialOptions: [...MAT_PVC_ALU],
    showGlassType: true,
    glassTypeOptions: [...GLASS_TYPES],
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
  },
  tabiqueria: {
    showMaterial: true,
    materialOptions: [...MAT_ALU],
    showGlassType: true,
    glassTypeOptions: [...GLASS_TYPES],
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
  },
  tabiqueria_banho: {
    showPanelType: true,
    panelTypeOptions: ["Vidrio", "Melamina", "Alucobond"],
    // No pidieron color explícito aquí; si luego quieres color para Vidrio, se puede habilitar igual que Shower.
  },
  puerta: {
    showMaterial: true,
    materialOptions: [...MAT_PVC_ALU],
    showGlassType: true,
    glassTypeOptions: [...GLASS_TYPES],
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
  },
  shower: {
    showMaterial: true,
    materialOptions: [...MAT_ALU],
    showShowerFrameColor: true,
    showerFrameColorOptions: ["Gris", "Negro", "Blanco"],
    showShowerType: true,
    showerTypeOptions: ["Acrílico", "Vidrio laminado"],
    // Color de vidrio solo si tipo = Vidrio laminado
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
    enableGlassColorOnlyIf: (opts) => opts.showerType === "Vidrio laminado",
  },
  muro_cortina: {
    showCurtainWallType: true,
    curtainWallTypeOptions: ["Vidrio", "Alucobond"],
    showGlassType: true,
    glassTypeOptions: [...GLASS_TYPES],
    showGlassColor: true,
    glassColorOptions: [...GLASS_COLORS],
    enableGlassOnlyIf: (opts) => opts.curtainWallType === "Vidrio",
  },
};

// opciones por defecto
export function defaultOptionsFor(t: ItemType): ItemOptions {
  const cfg = ITEM_CATALOG[t];
  const o: ItemOptions = {};
  if (cfg?.showMaterial && cfg.materialOptions?.length)
    o.material = cfg.materialOptions[0];
  if (cfg?.showGlassType && cfg.glassTypeOptions?.length)
    o.glassType = cfg.glassTypeOptions[0];
  if (cfg?.showGlassColor && cfg.glassColorOptions?.length)
    o.glassColor = cfg.glassColorOptions[0];
  if (cfg?.showShowerFrameColor && cfg.showerFrameColorOptions?.length)
    o.showerFrameColor = cfg.showerFrameColorOptions[0];
  if (cfg?.showShowerType && cfg.showerTypeOptions?.length)
    o.showerType = cfg.showerTypeOptions[0];
  if (cfg?.showPanelType && cfg.panelTypeOptions?.length)
    o.panelType = cfg.panelTypeOptions[0];
  if (cfg?.showCurtainWallType && cfg.curtainWallTypeOptions?.length)
    o.curtainWallType = cfg.curtainWallTypeOptions[0];
  return o;
}
