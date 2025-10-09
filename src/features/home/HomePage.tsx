// src/features/home/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
import { last10Quotes, searchQuotes, getQuotesStats } from "../../db";
import type { Quote } from "../../models";
import { useNavigate } from "react-router-dom";

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
    light: "bg-green-50",
  },
  accent: {
    bg: "bg-black",
    bgHover: "hover:bg-gray-800",
    text: "text-black",
  },
};

export default function HomePage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [data, setData] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCount: 0, totalValueCents: 0 });

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    (async () => {
      const [rows, statsData] = await Promise.all([
        q.trim() ? searchQuotes(q.trim()) : last10Quotes(),
        getQuotesStats(),
      ]);
      if (!cancel) {
        setData(rows);
        setStats(statsData);
        setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [q]);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    []
  );

  const moneyFmt = useMemo(() => new Intl.NumberFormat("es-CL"), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Gestiona tus cotizaciones
          </p>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Botón Nueva Cotización destacado */}
        <button
          onClick={() => nav("/quote")}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva cotización
        </button>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-8 h-8 rounded-lg ${COLORS.primary.light} ${COLORS.primary.text} flex items-center justify-center`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCount}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`w-8 h-8 rounded-lg ${COLORS.secondary.light} ${COLORS.secondary.text} flex items-center justify-center`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600">Valor</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              ${moneyFmt.format(Math.round(stats.totalValueCents / 100))}
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por número o cliente..."
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
            {q ? "Resultados" : "Últimas cotizaciones"}
          </h2>
          {data.length > 0 && (
            <span className="text-sm text-gray-500">
              {data.length} cotizacion{data.length !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        {/* Lista de cotizaciones */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {q ? "No se encontraron resultados" : "No hay cotizaciones"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {q
                ? "Intenta con otro término de búsqueda"
                : "Crea tu primera cotización para comenzar"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((row) => (
              <button
                key={row.id}
                onClick={() => nav(`/pdf/${row.number}`)}
                className="w-full bg-white rounded-2xl border border-gray-200 p-4 text-left hover:shadow-md active:scale-[0.99] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-base mb-1">
                      {row.number}
                    </div>
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="truncate">{row.clientName}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-lg ${COLORS.primary.light} text-xs font-medium ${COLORS.primary.text} mb-2`}
                    >
                      {fmt.format(new Date(row.dateMillis))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    $
                    {moneyFmt.format(
                      Math.round((row.grandTotalCents || 0) / 100)
                    )}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <span
                    className={`text-sm font-medium ${COLORS.primary.text} flex items-center gap-1`}
                  >
                    Ver detalles
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
