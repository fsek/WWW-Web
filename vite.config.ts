import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
	plugins: [react(), tailwindcss()],
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
