import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@features": path.resolve(import.meta.dirname, "src/features"),
      "@components": path.resolve(import.meta.dirname, "src/components"),
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
