// src/features/clients/ClientsPage.tsx
import { useEffect, useState, useRef } from "react";
import {
  listClients,
  upsertClient,
  searchClients,
  deleteClient,
} from "../../db";
import type { Client } from "../../models";

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

export default function ClientsPage() {
  const [list, setList] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Client | null>(null);

  const refresh = async () => {
    setLoading(true);
    const data = q.trim() ? await searchClients(q.trim()) : await listClients();
    setList(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [q]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setSheetOpen(true);
  };

  const handleNew = () => {
    setEditingClient(null);
    setSheetOpen(true);
  };

  const handleSave = async (client: Client) => {
    await upsertClient(client);
    setSheetOpen(false);
    setEditingClient(null);
    await refresh();
  };

  const handleDelete = async (client: Client) => {
    if (!client.id) return;
    await deleteClient(client.id);
    setDeleteConfirm(null);
    await refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Gestiona tu cartera de clientes
          </p>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Botón agregar cliente */}
        <button
          onClick={handleNew}
          className={`w-full h-14 rounded-2xl ${COLORS.accent.bg} text-white font-semibold ${COLORS.accent.bgHover} transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 mb-6`}
        >
          <svg
            className="w-6 h-6"
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
          Agregar cliente
        </button>

        {/* Estadística */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl ${COLORS.primary.light} ${COLORS.primary.text} flex items-center justify-center`}
            >
              <svg
                className="w-6 h-6"
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
            <div>
              <div className="text-sm text-gray-600">Total de clientes</div>
              <div className="text-2xl font-bold text-gray-900">
                {list.length}
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              className={`w-full h-12 rounded-xl border border-gray-300 pl-12 pr-4 bg-white ${COLORS.primary.ring} focus:ring-2 focus:border-transparent transition-all`}
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none"
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
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
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
            )}
          </div>
        </div>

        {/* Header de la lista */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {q ? "Resultados" : "Todos los clientes"}
          </h2>
          {list.length > 0 && (
            <span className="text-sm text-gray-500">
              {list.length} cliente{list.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Lista de clientes */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {q ? "No se encontraron resultados" : "No hay clientes"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {q
                ? "Intenta con otro término de búsqueda"
                : "Agrega tu primer cliente para comenzar"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 group"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleEdit(c)}
                    className="flex-1 flex items-start gap-3 text-left hover:opacity-70 transition-opacity"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${COLORS.primary.light} ${COLORS.primary.text} flex items-center justify-center flex-shrink-0`}
                    >
                      <svg
                        className="w-6 h-6"
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
                      <div className="font-semibold text-gray-900 mb-1">
                        {c.name}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>{c.phone}</span>
                        </div>
                      )}
                      {c.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="truncate">{c.address}</span>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setDeleteConfirm(c)}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all ${COLORS.danger.light} ${COLORS.danger.text} active:${COLORS.danger.bg} active:text-white`}
                    title="Eliminar cliente"
                    aria-label="Eliminar cliente"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet para editar */}
      {sheetOpen && (
        <ClientFormSheet
          client={editingClient}
          onClose={() => {
            setSheetOpen(false);
            setEditingClient(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <DeleteConfirmDialog
          client={deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

function DeleteConfirmDialog({
  client,
  onConfirm,
  onCancel,
}: {
  client: Client;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-full ${COLORS.danger.light} flex items-center justify-center`}
          >
            <svg
              className={`w-6 h-6 ${COLORS.danger.text}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              ¿Eliminar cliente?
            </h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Estás a punto de eliminar a <strong>{client.name}</strong>.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-12 rounded-xl ${COLORS.danger.bg} text-white font-medium ${COLORS.danger.bg} hover:${COLORS.danger.bgHover} transition-colors`}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientFormSheet({
  client,
  onClose,
  onSave,
}: {
  client: Client | null;
  onClose: () => void;
  onSave: (client: Client) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const [form, setForm] = useState<Client>(
    client || { name: "", email: "", phone: "", address: "" }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsExpanded(true), 10);
  }, []);

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
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100) {
      setIsExpanded(false);
      setTimeout(onClose, 200);
    } else {
      setDragY(0);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
      setTimeout(onClose, 200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-200 ${
        isExpanded ? "bg-black/40" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
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
        {/* Handle */}
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
            <h2 className="text-lg font-semibold text-gray-900">
              {client ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <button
              onClick={() => {
                setIsExpanded(false);
                setTimeout(onClose, 200);
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className={COLORS.danger.text}>*</span>
              </label>
              <input
                className={`w-full h-12 rounded-xl border border-gray-300 px-4 bg-white ${COLORS.primary.ring} focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Nombre completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                className={`w-full h-12 rounded-xl border border-gray-300 px-4 bg-white ${COLORS.primary.ring} focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Calle, número, comuna"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>
        </form>

        {/* Footer fijo */}
        <div className="border-t border-gray-100 p-6 bg-white">
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 h-12 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setIsExpanded(false);
                setTimeout(onClose, 200);
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className={`flex-1 h-12 rounded-xl ${COLORS.accent.bg} text-white font-medium ${COLORS.accent.bgHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              disabled={saving || !form.name.trim()}
            >
              {saving ? (
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
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
