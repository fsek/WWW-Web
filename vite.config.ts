import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: "postcss",
    lightningcss: {
      targets: browserslistToTargets(browserslist(">= 0.25%")),
    },
  },
  build: {
    cssMinify: "lightningcss",
    target: "es2022",
  },
  server: {
    port: 5175, 
    strictPort: true, 
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
