// src/lib/pdf/PdfViewerPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { getPdfFromDb } from "../lib/db/pdfStore";
import { deleteQuote } from "../db";
GlobalWorkerOptions.workerSrc = workerSrc;

// 🎨 SISTEMA DE COLORES CENTRALIZADO
const COLORS = {
  primary: {
    bg: "bg-blue-600",
    bgHover: "hover:bg-blue-700",
    text: "text-blue-600",
    ring: "focus:ring-blue-500",
    light: "bg-blue-50",
  },
  accent: {
    bg: "bg-black",
    bgHover: "hover:bg-gray-800",
  },
  danger: {
    text: "text-red-600",
  },
};

function MobileHeader({
  title,
  subtitle,
  onBack,
  onDelete,
  onShare,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center h-14 px-4">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-3 -ml-2 p-2 rounded-lg active:bg-gray-100 transition-colors"
            aria-label="Volver"
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
        <div className="flex items-center gap-1">
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 rounded-lg active:bg-blue-50 transition-colors"
              aria-label="Compartir cotización"
            >
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 rounded-lg active:bg-red-50 transition-colors"
              aria-label="Eliminar cotización"
            >
              <svg
                className="w-6 h-6 text-red-600"
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
          )}
        </div>
      </div>
    </div>
  );
}

function ControlBar({
  page,
  pageCount,
  scale,
  onPrevPage,
  onNextPage,
  onZoomOut,
  onZoomIn,
  loading,
}: {
  page: number;
  pageCount: number;
  scale: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  loading: boolean;
}) {
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex items-center gap-2">
        {/* Navegación de páginas */}
        <button
          onClick={onPrevPage}
          disabled={!canPrev || loading}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <svg
            className="w-5 h-5 text-gray-700"
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

        <div className="flex items-center gap-1 text-sm text-gray-600 min-w-fit px-2">
          <span className="font-medium">{page}</span>
          <span className="text-gray-400">/</span>
          <span>{pageCount}</span>
        </div>

        <button
          onClick={onNextPage}
          disabled={!canNext || loading}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <svg
            className="w-5 h-5 text-gray-700"
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
        </button>

        <div className="flex-1" />

        {/* Controles de zoom */}
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.5 || loading}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Alejar"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>

        <div className="flex items-center gap-1 text-sm text-gray-600 min-w-fit px-2">
          <span className="font-medium">{Math.round(scale * 100)}</span>
          <span className="text-gray-400">%</span>
        </div>

        <button
          onClick={onZoomIn}
          disabled={scale >= 3 || loading}
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Acercar"
        >
          <svg
            className="w-5 h-5 text-gray-700"
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
        </button>
      </div>
    </div>
  );
}

export default function PdfViewerPage() {
  const { number } = useParams<{ number: string }>();

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [sharing, setSharing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Carga el PDF desde IndexedDB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!number) {
        setError("No se especificó un documento");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const bytes = await getPdfFromDb(number);
        if (!bytes) {
          setError("No se encontró el documento solicitado");
          return;
        }

        const instance = await getDocument({ data: bytes }).promise;
        if (cancelled) return;

        setPdf(instance);
        setPage(1);
        setPageCount(instance.numPages);

        // Escala inicial: ajusta al ancho del contenedor
        const firstPage = await instance.getPage(1);
        const base = firstPage.getViewport({ scale: 1 });
        const cw = containerRef.current?.clientWidth ?? 390;
        const newScale = Math.max(0.75, Math.min(2.0, cw / base.width));
        setScale(newScale);
      } catch (err) {
        console.error("Error cargando PDF:", err);
        if (!cancelled) {
          setError("Error al cargar el documento");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [number]);

  // Render de la página actual
  useEffect(() => {
    if (!pdf) return;

    // Cancelar renderizado anterior si existe
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const pdfPage = await pdf.getPage(page);
        const viewport = pdfPage.getViewport({ scale });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        renderTaskRef.current = pdfPage.render({
          canvasContext: ctx,
          viewport,
          canvas,
        });

        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        // No mostrar error si fue cancelado
        if (err.name !== "RenderingCancelledException") {
          console.error("Error renderizando página:", err);
          setError("Error al renderizar la página");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdf, page, scale]);

  const handleGoBack = () => window.history.back();
  const handlePrevPage = () => page > 1 && setPage((p) => p - 1);
  const handleNextPage = () => page < pageCount && setPage((p) => p + 1);
  const handleZoomOut = () => setScale((s) => Math.max(0.5, s - 0.1));
  const handleZoomIn = () => setScale((s) => Math.min(3, s + 0.1));

  const handleDelete = async () => {
    if (!number) return;
    try {
      await deleteQuote(number);
      window.history.back();
    } catch (err) {
      console.error("Error eliminando cotización:", err);
      setError("Error al eliminar la cotización");
    }
  };

  const handleShare = async () => {
    if (!number || !pdf) return;

    setSharing(true);
    try {
      // Obtener el PDF del IndexedDB
      const bytes = await getPdfFromDb(number);
      if (!bytes) {
        setError("No se pudo obtener el documento para compartir");
        return;
      }

      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const file = new File([blob], `${number}.pdf`, {
        type: "application/pdf",
      });
      // Intentar usar Web Share API
      const nav = navigator as Navigator & {
        canShare?: (d?: any) => boolean;
        share?: (d: any) => Promise<void>;
      };

      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        try {
          await nav.share({
            files: [file],
            title: `Cotización ${number}`,
            text: `Cotización: ${number}`,
          });
        } catch (err: any) {
          // El usuario canceló el compartir (es normal)
          if (err.name !== "AbortError") {
            console.error("Error compartiendo:", err);
          }
        }
      } else {
        // Fallback: descargar si no soporta Web Share API
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${number}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.error("Error preparando compartir:", err);
      setError("Error al preparar el documento para compartir");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <MobileHeader
        title="Ver cotización"
        subtitle={number ? `${number}` : ""}
        onBack={handleGoBack}
        onShare={handleShare}
        onDelete={() => setDeleteConfirm(true)}
      />

      {error ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Error al cargar el documento
            </h2>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <ControlBar
            page={page}
            pageCount={pageCount}
            scale={scale}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onZoomOut={handleZoomOut}
            onZoomIn={handleZoomIn}
            loading={loading}
          />

          <div className="flex-1 overflow-auto flex items-start justify-center bg-gray-50">
            <div ref={containerRef} className="w-full max-w-2xl p-4">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto display-block bg-white"
                  style={{ display: "block" }}
                />
              </div>

              {loading && (
                <div className="flex items-center justify-center mt-4">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-600"
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
                  <span className="ml-2 text-sm text-gray-600">
                    Cargando página...
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
                  ¿Eliminar cotización?
                </h3>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              Estás a punto de eliminar la cotización <strong>{number}</strong>.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 h-12 rounded-xl border border-gray-300 font-medium text-gray-700 active:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white font-medium active:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
