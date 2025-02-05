import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		esbuildOptions: {
			target: "esnext",
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	css: {
		transformer: "postcss",
	},
	server: {
		port: 5175,
		strictPort: true,
		proxy: {
			"/api": {
				target: "http://localhost:8000",
				changeOrigin: true,
				ws: true,
			},
		},
	},
});
