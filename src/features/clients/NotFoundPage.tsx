import { useNavigate } from "react-router-dom";

// 🎨 Sistema de colores consistente con tu app
const COLORS = {
  primary: {
    bg: "bg-blue-600",
    bgHover: "hover:bg-blue-700",
    text: "text-blue-600",
    light: "bg-blue-50",
  },
  accent: {
    bg: "bg-black",
    bgHover: "hover:bg-gray-800",
  },
};

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Icono animado */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Círculo de fondo con animación */}
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>

            {/* Icono principal */}
            <div
              className={`relative ${COLORS.primary.light} rounded-full p-8`}
            >
              <svg
                className={`h-24 w-24 ${COLORS.primary.text}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className={`w-full h-12 px-6 rounded-xl ${COLORS.accent.bg} text-white font-medium ${COLORS.accent.bgHover} transition-colors flex items-center justify-center gap-2`}
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Volver al inicio
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full h-12 px-6 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver atrás
            </button>
          </div>
        </div>

        {/* Sugerencias */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Accesos rápidos
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/quote")}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3"
            >
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  Nueva cotización
                </div>
                <div className="text-xs text-gray-600">
                  Crear una cotización nueva
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/clients")}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3"
            >
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  Ver clientes
                </div>
                <div className="text-xs text-gray-600">
                  Lista de tus clientes
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
