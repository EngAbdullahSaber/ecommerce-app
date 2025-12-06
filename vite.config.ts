import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/postcss";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  build: {
    // Disable minification errors
    minify: "terser",
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress all warnings
        return;
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  // Disable type checking
  esbuild: {
    logLevel: "error", // Only show errors, not warnings
  },
});
