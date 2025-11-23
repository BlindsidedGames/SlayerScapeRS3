import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Deploys under blindsidedgames.com/games/slayerscape/
const base = "/games/slayerscape/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"],
      manifest: {
        name: "SlayerScape RS3",
        short_name: "SlayerScape",
        start_url: base,
        scope: base,
        display: "standalone",
        theme_color: "#0d0f1a",
        background_color: "#0d0f1a",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/apps\.runescape\.com\/runemetrics\/?.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "runemetrics-cache",
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/runescape\.wiki\/?.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "rs-wiki-cache",
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
