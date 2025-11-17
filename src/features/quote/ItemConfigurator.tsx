// src/features/quote/ItemConfigurator.tsx
import { useState, useRef, useEffect } from "react";
import { useQuoteDraft } from "../../stores/quoteDraft";
import type {
  QuoteItemDraft,
  ItemOptions,
  ItemType,
} from "../../stores/quoteDraft";
import { imageForItem } from "../../catalog/imageCatalog";
import { ITEM_TYPE_LABEL } from "../../catalog/itemCatalog";

const GLASS_TYPES = ["Templado", "Termopanel", "Simple", "Laminado"] as const;
const GLASS_COLORS = ["incoloro", "verde", "gris", "bronce"] as const;
const SHOWER_FRAME_COLORS = ["Gris", "Negro", "Blanco"] as const;
const TABIQUERIA_BANHO_TYPES = ["Vidrio", "Melamina", "Alucobond"] as const;
const MURO_CORTINA_TYPES = ["Vidrio", "Alucobond"] as const;

const MATERIALS_BY_TYPE: Record<ItemType, readonly ItemOptions["material"][]> =
  {
    ventana_fija_42: ["PVC Blanco", "PVC Madera"],
    ventana_proyectante_42: ["PVC Blanco", "PVC Madera"],
    ventana_corredera_20: ["PVC Blanco", "PVC Madera"],
    ventana_corredera_25: ["PVC Blanco", "PVC Madera"],
    bow_windows: ["PVC Blanco", "PVC Madera", "Aluminio"],
    tabiqueria: ["Aluminio"],
    tabiqueria_banho: ["Aluminio"],
    muro_cortina: ["Aluminio"],
    puerta: ["PVC Blanco", "PVC Madera", "Aluminio"],
    shower: ["Aluminio"],
  };

type Props = {
  tempId: string;
  onCancel: () => void;
  onSave: (patch: Partial<QuoteItemDraft>) => void;
};

export default function ItemConfigurator({ tempId, onCancel, onSave }: Props) {
  const draft = useQuoteDraft();
  const current = draft.items.find((x) => x.tempId === tempId);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsExpanded(true), 10);
  }, []);

  if (!current) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="text-sm text-gray-600">El ítem ya no existe.</div>
          <div className="mt-4 text-right">
            <button
              className="h-10 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              onClick={onCancel}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const normType: ItemType = current.type as ItemType;
  const itemLabel = ITEM_TYPE_LABEL[normType] ?? current.title;
  const availableMaterials = MATERIALS_BY_TYPE[normType] ?? [];

  const [widthMm, setWidthMm] = useState<number | undefined>(current.widthMm);
  const [heightMm, setHeightMm] = useState<number | undefined>(
    current.heightMm
  );
  const [quantity, setQuantity] = useState<number>(current.quantity ?? 1);
  const [unitPriceCents, setUnitPriceCents] = useState<number>(
    current.unitPriceCents ?? 0
  );
  const [location, setLocation] = useState<string>(current.location ?? "");
  const [opts, setOpts] = useState<ItemOptions>(current.options ?? {});

  const isShower = normType === "shower";
  const isMuroCortina = normType === "muro_cortina";
  const isTabiqueriaBanho = normType === "tabiqueria_banho";

  const showGlassBase = !isTabiqueriaBanho && !isShower && !isMuroCortina;
  const showGlassForShower = isShower && opts.showerType === "Vidrio laminado";
  const showGlassForCurtain =
    isMuroCortina && opts.curtainWallType === "Vidrio";
  const showGlassSelects =
    showGlassBase || showGlassForShower || showGlassForCurtain;

  const previewUrl = imageForItem(normType, opts);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    currentY.current = touch.clientY;
    const delta = currentY.current - startY.current;

    // Solo permitir arrastrar hacia abajo
    if (delta > 0) {
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Si arrastra más de 100px, cerrar
    if (dragY > 100) {
      setIsExpanded(false);
      setTimeout(onCancel, 200);
    } else {
      setDragY(0);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
      setTimeout(onCancel, 200);
    }
  };

  const save = () => {
    const next: ItemOptions = { ...opts };

    if (isMuroCortina && next.curtainWallType !== "Vidrio") {
      next.glassType = undefined;
      next.glassColor = undefined;
    }
    if (isShower && next.showerType !== "Vidrio laminado") {
      next.glassColor = undefined;
    }

    onSave({
      title: itemLabel,
      widthMm,
      heightMm,
      quantity,
      unitPriceCents,
      location: location.trim() || undefined,
      options: next,
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-200 ${
        isExpanded ? "bg-black/40" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-h-[90vh] flex flex-col ${
          isExpanded ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          transform: isDragging
            ? `translateY(${dragY}px)`
            : isExpanded
            ? "translateY(0)"
            : "translateY(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle para arrastrar */}
        <div
          className="pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{itemLabel}</h2>
            <button
              onClick={() => {
                setIsExpanded(false);
                setTimeout(onCancel, 200);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Preview */}
          {previewUrl && (
            <div className="mb-6 bg-gray-50 rounded-2xl p-4">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-full max-h-56 object-contain"
              />
            </div>
          )}

          <div className="space-y-4">
            {/* MATERIAL */}
            {availableMaterials.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <select
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={opts.material ?? ""}
                  onChange={(e) =>
                    setOpts({
                      ...opts,
                      material: e.target.value as ItemOptions["material"],
                    })
                  }
                >
                  <option value="">Seleccionar material</option>
                  {availableMaterials.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Específicos por tipo */}
            {isTabiqueriaBanho && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de panel
                </label>
                <select
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={opts.panelType ?? ""}
                  onChange={(e) =>
                    setOpts({
                      ...opts,
                      panelType: e.target.value as ItemOptions["panelType"],
                    })
                  }
                >
                  <option value="">Seleccionar tipo</option>
                  {TABIQUERIA_BANHO_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isMuroCortina && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de muro cortina
                </label>
                <select
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={opts.curtainWallType ?? ""}
                  onChange={(e) =>
                    setOpts({
                      ...opts,
                      curtainWallType: e.target
                        .value as ItemOptions["curtainWallType"],
                    })
                  }
                >
                  <option value="">Seleccionar tipo</option>
                  {MURO_CORTINA_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isShower && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de shower
                  </label>
                  <select
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={opts.showerType ?? ""}
                    onChange={(e) =>
                      setOpts({
                        ...opts,
                        showerType: e.target.value as ItemOptions["showerType"],
                      })
                    }
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Acrílico">Acrílico</option>
                    <option value="Vidrio laminado">Vidrio laminado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de perfilería
                  </label>
                  <select
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={opts.showerFrameColor ?? ""}
                    onChange={(e) =>
                      setOpts({
                        ...opts,
                        showerFrameColor: e.target
                          .value as ItemOptions["showerFrameColor"],
                      })
                    }
                  >
                    <option value="">Seleccionar color</option>
                    {SHOWER_FRAME_COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Vidrio + Color */}
            {showGlassSelects && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de vidrio
                  </label>
                  <select
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={opts.glassType ?? ""}
                    onChange={(e) =>
                      setOpts({
                        ...opts,
                        glassType: e.target.value as ItemOptions["glassType"],
                      })
                    }
                  >
                    <option value="">Seleccionar tipo</option>
                    {GLASS_TYPES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de vidrio
                  </label>
                  <select
                    className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={opts.glassColor ?? ""}
                    onChange={(e) =>
                      setOpts({
                        ...opts,
                        glassColor: e.target.value as ItemOptions["glassColor"],
                      })
                    }
                  >
                    <option value="">Seleccionar color</option>
                    {GLASS_COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Medidas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiones (mm)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  inputMode="numeric"
                  placeholder="Ancho"
                  value={widthMm ?? ""}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setWidthMm(
                      e.target.value
                        ? Math.max(0, Number(e.target.value))
                        : undefined
                    )
                  }
                />
                <input
                  className="h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  inputMode="numeric"
                  placeholder="Alto"
                  value={heightMm ?? ""}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setHeightMm(
                      e.target.value
                        ? Math.max(0, Number(e.target.value))
                        : undefined
                    )
                  }
                />
              </div>
            </div>

            {/* Cantidad + Precio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <input
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="1.00"
                  value={quantity}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setQuantity(Math.max(0, Number(e.target.value || 0)))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (CLP)
                </label>
                <input
                  className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  inputMode="decimal"
                  step="1"
                  placeholder="0"
                  value={Math.floor((unitPriceCents || 0) / 100)}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setUnitPriceCents(
                      Math.max(0, Math.round(Number(e.target.value || 0) * 100))
                    )
                  }
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalle
              </label>
              <input
                className="w-full h-12 rounded-xl border border-gray-300 px-4 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="ej. dormitorio, cocina..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer fijo con botones */}
        <div className="border-t border-gray-100 p-6 bg-white">
          <div className="flex gap-3">
            <button
              className="flex-1 h-12 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setIsExpanded(false);
                setTimeout(onCancel, 200);
              }}
            >
              Cancelar
            </button>
            <button
              className="flex-1 h-12 rounded-xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
              onClick={save}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
