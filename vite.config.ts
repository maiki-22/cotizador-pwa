import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { copyFileSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Cotizador",
        short_name: "Cotizador",
        description: "Cotizador PWA",
        start_url: "/cotizador-pwa/",
        scope: "/cotizador-pwa/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4f46e5",
        icons: [
          {
            src: "/cotizador-pwa/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/cotizador-pwa/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/cotizador-pwa/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: "/cotizador-pwa/index.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/],
      },
    }),
    {
      name: "copy-nojekyll",
      closeBundle() {
        copyFileSync(".nojekyll", "dist/.nojekyll");
      },
    },
  ],
  base: "/cotizador-pwa/",
});
