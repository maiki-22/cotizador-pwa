import React, { type ReactNode } from "react";
import { NavLink } from "react-router-dom";

type ShellProps = { children: ReactNode };

// 🎨 Sistema de colores consistente con QuoteWizardPage
const COLORS = {
  primary: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    light: "bg-blue-50",
  },
  accent: {
    bg: "bg-black",
    text: "text-black",
  },
  neutral: {
    text: "text-gray-500",
    textHover: "text-gray-700",
    textActive: "text-gray-900",
  },
};

function IconHome() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-9z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  );
}

function IconQuote() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.5h7.5L21 10v10.5A1.5 1.5 0 0 1 19.5 22h-12A1.5 1.5 0 0 1 6 20.5V5A1.5 1.5 0 0 1 7.5 3.5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5V9H21" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 13h7M8.5 16.5h7"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 14.5c2.485 0 4.5 2.015 4.5 4.5v1h-9v-1c0-2.485 2.015-4.5 4.5-4.5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 11.5c2.2 0 4 1.8 4 4v1.5H1v-1.5c0-2.2 1.8-4 4-4z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      />
    </svg>
  );
}

export default function Shell({ children }: ShellProps) {
  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header mejorado */}
      <header
        className="sticky top-0 z-20 bg-white border-b border-gray-200"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center h-14 px-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Hola, Juan!</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        className="pb-24"
        style={{
          paddingBottom: "calc(5rem + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </main>

      {/* Tab Bar mejorado */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-3 h-20">
          <Tab to="/" label="Inicio" end icon={<IconHome />} />
          <Tab to="/quote" label="Nueva" icon={<IconQuote />} />
          <Tab to="/clients" label="Clientes" icon={<IconUsers />} />
        </div>
      </nav>
    </div>
  );
}

function Tab({
  to,
  label,
  icon,
  end,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex flex-col items-center justify-center gap-1.5 text-xs font-medium transition-all relative",
          isActive
            ? `${COLORS.accent.text}`
            : `${COLORS.neutral.text} hover:${COLORS.neutral.textHover} active:${COLORS.neutral.textActive}`,
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {/* Indicador activo */}
          {isActive && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-black rounded-full" />
          )}

          {/* Icono con fondo cuando está activo */}
          <div
            className={`transition-all ${isActive ? "scale-110" : "scale-100"}`}
          >
            {icon}
          </div>

          {/* Label */}
          <span className={isActive ? "font-semibold" : "font-medium"}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
