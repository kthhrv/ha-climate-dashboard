import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../../custom_components/climate_dashboard/www",
    emptyOutDir: true,
    lib: {
      entry: "main.ts",
      formats: ["es"],
      fileName: "climate-dashboard",
    },
    rollupOptions: {
      // Externalize dependencies that might overlap with HA if needed,
      // but for a panel we usually bundle Lit to be safe unless using HA's provided modules.
      // We will bundle everything for a standalone panel to ensure stability.
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
