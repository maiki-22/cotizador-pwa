// src/features/quote/QuoteWizardPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuoteDraft } from "../../stores/quoteDraft";
import { listClients, insertClient, db } from "../../db";
import type { Client, Quote, QuoteItem } from "../../models";
import type { QuoteItemDraft } from "../../stores/quoteDraft";
import { BRAND } from "../../brand";
import { buildAndDownloadQuotePdf } from "../../pdf/renderQuotePdf";
import { ITEM_TYPE_LABEL } from "../../catalog/itemCatalog";
import ItemConfigurator from "./ItemConfigurator";
import type { ItemType } from "../../stores/quoteDraft";

// 🎨 SISTEMA DE COLORES CENTRALIZADO
const COLORS = {
  primary: {
    bg: "bg-blue-600",
    bgHover: "hover:bg-blue-700",
    text: "text-blue-600",
    border: "border-blue-600",
    ring: "focus:ring-blue-500",
    light: "bg-blue-50",
    lightText: "text-blue-700",
  },
  secondary: {
    bg: "bg-green-600",
    bgHover: "hover:bg-green-700",
    text: "text-green-600",
    border: "border-green-600",
    ring: "focus:ring-green-500",
    light: "bg-green-50",
    lightText: "text-green-700",
  },
  accent: {
    bg: "bg-black",
    bgHover: "hover:bg-gray-800",
    text: "text-black",
  },
  danger: {
    bg: "bg-red-600",
    bgHover: "hover:bg-red-700",
    text: "text-red-600",
    border: "border-red-200",
    light: "bg-red-50",
  },
};

type Step = "choose" | "existing" | "new" | "items" | "review";

// Componente reutilizable para header móvil
function MobileHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center h-14 px-4">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-3 -ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-600 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuoteWizardPage() {
  const draft = useQuoteDraft();
  const [step, setStep] = useState<Step>("choose");

  if (step === "choose") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader
          title="Nueva cotización"
          subtitle="Selecciona el tipo de cliente"
        />

        <div className="p-4 space-y-3">
          <button
            className={`group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 text-left transition-all ${COLORS.primary.border} hover:border-opacity-100 hover:border-blue-500 hover:shadow-lg w-full`}
            onClick={() => setStep("existing")}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${COLORS.primary.light} ${COLORS.primary.text} transition-colors group-hover:${COLORS.primary.bg} group-hover:text-white`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  Cliente existente
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Busca en tu lista de clientes guardados
                </div>
              </div>
            </div>
          </button>

          <button
            className={`group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-green-500 hover:shadow-lg w-full`}
            onClick={() => setStep("new")}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${COLORS.secondary.light} ${COLORS.secondary.text} transition-colors group-hover:${COLORS.secondary.bg} group-hover:text-white`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Cliente nuevo</div>
                <div className="text-sm text-gray-600 mt-1">
                  Ingresa los datos y opcionalmente guárdalo
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (step === "existing") {
    return (
      <ExistingClientPicker
        onCancel={() => setStep("choose")}
        onPick={(c) => {
          if (!c.id) {
            alert("El cliente seleccionado no tiene ID válido.");
            return;
          }
          draft.setExistingClient({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: c.address,
          });
          setStep("items");
        }}
      />
    );
  }

  if (step === "new") {
    const initialInline =
      draft.clientId == null &&
      (draft.clientName?.trim() ||
        draft.clientEmail ||
        draft.clientPhone ||
        draft.clientAddress)
        ? {
            persist: draft.saveClientToBook,
            name: draft.clientName ?? "",
            email: draft.clientEmail ?? "",
            phone: draft.clientPhone ?? "",
            address: draft.clientAddress ?? "",
          }
        : undefined;

    return (
      <NewClientForm
        initial={initialInline}
        onCancel={() => setStep("choose")}
        onSubmit={(c, persist) => {
          draft.setInlineClient(c, persist);
          setStep("items");
        }}
      />
    );
  }

  if (step === "items") {
    return (
      <ItemsStep
        onBack={() => setStep(draft.clientId ? "existing" : "new")}
        onNext={() => setStep("review")}
      />
    );
  }

  return (
    <ReviewStep
      onBack={() => setStep("items")}
      onFinish={async () => {
        const name = draft.clientName?.trim() ?? "";
        if (!name) {
          alert("Debes ingresar un cliente válido");
          return;
        }

        let usedClient: Client | undefined;

        if (draft.clientId) {
          usedClient = {
            id: draft.clientId,
            name: draft.clientName ?? "",
            email: draft.clientEmail,
            phone: draft.clientPhone,
            address: draft.clientAddress,
          };
        } else if (draft.saveClientToBook) {
          const id = await insertClient({
            name,
            email: draft.clientEmail,
            phone: draft.clientPhone,
            address: draft.clientAddress,
          });
          usedClient = {
            id,
            name,
            email: draft.clientEmail,
            phone: draft.clientPhone,
            address: draft.clientAddress,
          };
        } else {
          usedClient = {
            name,
            email: draft.clientEmail,
            phone: draft.clientPhone,
            address: draft.clientAddress,
          } as Client;
        }

        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const datePart = `${dd}${mm}${yyyy}`;
        const number = `COT-${datePart}-${Date.now().toString().slice(-4)}`;

        const net = draft.items.reduce(
          (acc: number, it: QuoteItemDraft) => acc + (it.subtotalCents ?? 0),
          0
        );
        const iva = Math.round(net * (BRAND.IVA_PERCENT / 100));
        const total = net + iva;

        const quote: Quote = {
          number,
          dateMillis: Date.now(),
          clientName: usedClient.name,
          clientEmail: usedClient.email,
          clientPhone: usedClient.phone,
          clientAddress: usedClient.address,
          netTotalCents: net,
          ivaCents: iva,
          grandTotalCents: total,
        };
        const qid = await db.quotes.add(quote);

        const items = draft.items.map((d) => ({
          quoteId: qid,
          title: d.title,
          widthMm: d.widthMm ?? undefined,
          heightMm: d.heightMm ?? undefined,
          quantity: d.quantity ?? 1,
          unitPriceCents: d.unitPriceCents ?? 0,
          subtotalCents: d.subtotalCents ?? 0,
          type: d.type as ItemType | undefined,
          options: d.options,
          location: d.location,
        }));

        await buildAndDownloadQuotePdf(quote, items, BRAND);
        useQuoteDraft.getState().clearAll();
        window.history.back();
      }}
    />
  );
}

function ExistingClientPicker({
  onPick,
  onCancel,
}: {
  onPick: (c: Client) => void;
  onCancel: () => void;
}) {
  const [rows, setRows] = useState<Client[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("../../db");
      const data = q ? await mod.searchClients(q) : await listClients();
      if (!cancelled) setRows(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader
        title="Seleccionar cliente"
        subtitle={`${rows.length} cliente${rows.length !== 1 ? "s" : ""}`}
        onBack={onCancel}
      />

      <div className="p-4">
        <div className="relative mb-4">
          <input
            className={`w-full h-12 rounded-xl border border-gray-300 pl-12 pr-4 bg-white ${COLORS.primary.ring} focus:ring-2 focus:border-transparent transition-all`}
            placeholder="Buscar por nombre, email o teléfono..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <svg
            className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {rows.map((c: Client) => (
            <button
              key={c.id}
              className="w-full p-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={() => onPick(c)}
            >
              <div className="font-semibold text-gray-900">{c.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                {[c.email, c.phone].filter(Boolean).join(" • ")}
              </div>
            </button>
          ))}
          {rows.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-2">No se encontraron clientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewClientForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?:
    | {
        persist: boolean;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
      }
    | undefined;
  onSubmit: (c: Omit<Client, "id">, persist: boolean) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [persist, setPersist] = useState(initial?.persist ?? true);

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader
        title="Cliente nuevo"
        subtitle="Ingresa los datos del cliente"
        onBack={onCancel}
      />

      <form
        className="p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name, email, phone, address }, persist);
        }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span className={COLORS.danger.text}>*</span>
            </label>
            <input
              className={`w-full h-12 rounded-xl border border-gray-300 px-4 bg-white ${COLORS.primary.ring} focus:ring-2 focus:border-transparent transition-all`}
              placeholder="Nombre completo del cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className={`w-full h-12 rounded-xl border border-gray-300 px-4 bg-white ${COLORS.primary.ring} focus:ring-2 focus:border-transparent transition-all`}
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              className={`w-full h-12 rounded-xl border border-gray-300 px-4 bg-white ${COLORS.primary.ring} focus:ring-2 focus:border-transparent transition-all`}
              placeholder="+56 9 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              className={`w-full h-12 rounded-xl border border-gray-300 px-4 bg-white ${COLORS.primary.ring} focus:ring-2 focus:border-transparent transition-all`}
              placeholder="Calle, número, comuna"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={persist}
                onChange={(e) => setPersist(e.target.checked)}
                className={`w-5 h-5 rounded border-gray-300 ${COLORS.primary.text} ${COLORS.primary.ring} focus:ring-2`}
              />
              <span className="text-sm text-gray-700">
                Guardar en la lista de clientes
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full h-12 px-6 rounded-xl ${COLORS.accent.bg} text-white font-medium ${COLORS.accent.bgHover} transition-colors`}
        >
          Continuar
        </button>
      </form>
    </div>
  );
}

function ItemsStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const draft = useQuoteDraft();
  const okClient = !!(draft.clientName && draft.clientName.trim());

  const [pickerOpen, setPickerOpen] = useState(false);
  const [config, setConfig] = useState<null | {
    mode: "new" | "edit";
    tempId: string;
  }>(null);

  const openEdit = (tempId: string) => {
    setConfig({ mode: "edit", tempId });
  };

  const subtotal = draft.items.reduce(
    (acc: number, it: QuoteItemDraft) => acc + (it.subtotalCents ?? 0),
    0
  );

  return (
    <>
      {/* Contenedor principal con scroll */}
      <div className="min-h-screen bg-gray-50">
        <MobileHeader
          title="Ítems"
          subtitle={`${draft.items.length} ítem${
            draft.items.length !== 1 ? "s" : ""
          }`}
          onBack={onBack}
        />

        {/* Contenido con padding para footer + tabbar */}
        <div
          className="p-4"
          style={{
            // Footer (110px) + TabBar (80px) + safe-area
            paddingBottom: "calc(190px + env(safe-area-inset-bottom))",
          }}
        >
          {/* Tarjeta del cliente */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
            {!okClient ? (
              <div className="flex items-center gap-3 text-red-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Debes seleccionar un cliente
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${COLORS.primary.light} ${COLORS.primary.text}`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">
                    {draft.clientName}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {[draft.clientEmail, draft.clientPhone]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {draft.clientId
                      ? "Cliente existente"
                      : draft.saveClientToBook
                      ? "Se guardará en clientes"
                      : "Cliente temporal"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón agregar */}
          <button
            className={`w-full h-14 rounded-xl border-2 border-dashed border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-700 hover:text-blue-600 font-medium mb-4`}
            onClick={() => setPickerOpen(true)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Agregar ítem
          </button>

          {/* Lista de ítems */}
          <div className="space-y-3">
            {draft.items.map((it, idx) => (
              <div
                key={it.tempId}
                className="bg-white rounded-2xl border border-gray-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">
                      {it.title}
                    </div>

                    {/* Detalles */}
                    <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                      {it.options?.material && (
                        <div>Material: {it.options.material}</div>
                      )}
                      {it.options?.glassType && (
                        <div>
                          Vidrio: {it.options.glassType}{" "}
                          {it.options.glassColor &&
                            `· ${it.options.glassColor}`}
                        </div>
                      )}
                      {it.options?.curtainWallType && (
                        <div>Tipo: {it.options.curtainWallType}</div>
                      )}
                      {it.options?.showerType && (
                        <div>
                          Tipo: {it.options.showerType}{" "}
                          {it.options.showerFrameColor &&
                            `· ${it.options.showerFrameColor}`}
                        </div>
                      )}
                      {it.widthMm && it.heightMm && (
                        <div>
                          Dimensiones: {it.widthMm} × {it.heightMm} mm
                        </div>
                      )}
                      {it.location && <div>Ubicación: {it.location}</div>}
                    </div>

                    {/* Precio */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {it.quantity} × $
                        {Intl.NumberFormat("es-CL").format(
                          (it.unitPriceCents ?? 0) / 100
                        )}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        = $
                        {Intl.NumberFormat("es-CL").format(
                          (it.subtotalCents ?? 0) / 100
                        )}
                      </span>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 mt-3">
                      <button
                        className="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        onClick={() => openEdit(it.tempId)}
                      >
                        Editar
                      </button>
                      <button
                        className={`h-9 px-3 rounded-lg border ${COLORS.danger.border} text-sm font-medium ${COLORS.danger.text} hover:${COLORS.danger.light} active:bg-red-100 transition-colors`}
                        onClick={() => draft.removeItem(it.tempId)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {draft.items.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="mt-4 text-gray-600 font-medium">
                  No hay ítems agregados
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Toca "Agregar ítem" para comenzar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer fijo FUERA del contenedor con scroll */}
      <div
        className="fixed left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30"
        style={{
          // Se posiciona justo arriba del tab bar (80px)
          bottom: "calc(80px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="p-4">
          {draft.items.length > 0 && (
            <div className="mb-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">
                ${Intl.NumberFormat("es-CL").format(subtotal / 100)}
              </span>
            </div>
          )}
          <button
            className={`w-full h-12 px-6 rounded-xl ${COLORS.accent.bg} text-white font-medium ${COLORS.accent.bgHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={onNext}
            disabled={!okClient || draft.items.length === 0}
          >
            Revisar cotización
          </button>
        </div>
      </div>

      {/* Diálogos */}
      {pickerOpen && (
        <AddItemDialog
          onCancel={() => setPickerOpen(false)}
          onPick={(type) => {
            setPickerOpen(false);
            const id = draft.startNewItem(type);
            setConfig({ mode: "new", tempId: id });
          }}
        />
      )}

      {config && (
        <ItemConfigurator
          tempId={config.tempId}
          onCancel={() => {
            if (config.mode === "new") draft.removeItem(config.tempId);
            setConfig(null);
          }}
          onSave={(patch) => {
            draft.updateItem(config.tempId, patch);
            setConfig(null);
          }}
        />
      )}
    </>
  );
}

function AddItemDialog({
  onCancel,
  onPick,
}: {
  onCancel: () => void;
  onPick: (t: ItemType) => void;
}) {
  const [type, setType] = useState<ItemType | "">("");
  const options = Object.entries(ITEM_TYPE_LABEL) as [ItemType, string][];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Seleccionar tipo de ítem
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-6 max-h-96 overflow-y-auto">
          {options.map(([key, label]) => (
            <button
              key={key}
              className={`h-14 px-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                type === key
                  ? `${COLORS.primary.border} ${COLORS.primary.light} ${COLORS.primary.lightText}`
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
              onClick={() => setType(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            className="flex-1 h-12 rounded-xl border border-gray-300 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className={`flex-1 h-12 rounded-xl ${COLORS.accent.bg} text-white font-medium ${COLORS.accent.bgHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!type}
            onClick={() => onPick(type as ItemType)}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: () => Promise<void>;
}) {
  const draft = useQuoteDraft();
  const [loading, setLoading] = useState(false);

  const net = draft.items.reduce(
    (acc: number, it: QuoteItemDraft) => acc + (it.subtotalCents ?? 0),
    0
  );
  const iva = Math.round(net * (BRAND.IVA_PERCENT / 100));
  const total = net + iva;
  const fmt = useMemo(() => new Intl.NumberFormat("es-CL"), []);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await onFinish();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Contenedor principal con scroll */}
      <div className="min-h-screen bg-gray-50">
        <MobileHeader
          title="Revisar cotización"
          subtitle="Verifica los detalles"
          onBack={onBack}
        />

        {/* Contenido con padding para footer + tabbar */}
        <div
          className="p-4"
          style={{
            // Footer (~80px) + TabBar (80px) + safe-area
            paddingBottom: "calc(160px + env(safe-area-inset-bottom))",
          }}
        >
          {/* Cliente */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Cliente
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">
                    {draft.clientName}
                  </div>
                  {draft.clientEmail && (
                    <div className="text-sm text-gray-600 break-words">
                      {draft.clientEmail}
                    </div>
                  )}
                  {draft.clientPhone && (
                    <div className="text-sm text-gray-600">
                      {draft.clientPhone}
                    </div>
                  )}
                  {draft.clientAddress && (
                    <div className="text-sm text-gray-600">
                      {draft.clientAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de ítems */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Ítems ({draft.items.length})
            </h3>
            <div className="space-y-3">
              {draft.items.map((it, idx) => (
                <div
                  key={it.tempId}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {it.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {it.quantity} × $
                      {fmt.format((it.unitPriceCents ?? 0) / 100)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ${fmt.format((it.subtotalCents ?? 0) / 100)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white mb-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
              Totales
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-lg font-semibold">
                  ${fmt.format(net / 100)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">
                  IVA ({BRAND.IVA_PERCENT}%)
                </span>
                <span className="text-lg font-semibold">
                  ${fmt.format(iva / 100)}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-3xl font-bold">
                    ${fmt.format(total / 100)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer fijo FUERA del contenedor con scroll */}
      <div
        className="fixed left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30"
        style={{
          // Se posiciona justo arriba del tab bar (80px)
          bottom: "calc(80px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="p-4">
          <button
            className={`w-full h-12 px-6 rounded-xl ${COLORS.accent.bg} text-white font-medium ${COLORS.accent.bgHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            onClick={handleFinish}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generando PDF...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Generar PDF
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
