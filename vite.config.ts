import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === "build" ? "/unikanban/" : "/",
  root: ".",
  build: {
    outDir: "dist-app",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        demo: resolve(__dirname, "demo/index.html"),
        stats: resolve(__dirname, "stats/index.html"),
      },
    },
  },
}));
