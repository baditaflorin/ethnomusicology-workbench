import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  version: string;
};

const gitCommit = () => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "local";
  }
};

export default defineConfig({
  base: "/ethnomusicology-workbench/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Ethnomusicology Workbench",
        short_name: "EthnoWorkbench",
        description:
          "Local-first field recording transcription, analysis, annotation, statistics, and score export.",
        theme_color: "#14332f",
        background_color: "#f6f3ea",
        display: "standalone",
        start_url: "/ethnomusicology-workbench/",
        icons: [
          {
            src: "pwa-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "pwa-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        navigateFallback: "/ethnomusicology-workbench/index.html",
        globPatterns: ["**/*.{js,css,html,svg,woff2}"]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VITE_APP_VERSION ?? packageJson.version),
    __BUILD_COMMIT__: JSON.stringify(process.env.VITE_BUILD_COMMIT ?? gitCommit()),
    __REPO_URL__: JSON.stringify("https://github.com/baditaflorin/ethnomusicology-workbench"),
    __PAYPAL_URL__: JSON.stringify("https://www.paypal.com/paypalme/florinbadita")
  },
  build: {
    outDir: "docs",
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          query: ["@tanstack/react-query"],
          icons: ["lucide-react"]
        }
      }
    }
  }
});
