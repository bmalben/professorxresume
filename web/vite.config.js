import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: env.VITE_API_URL
        ? undefined
        : {
            "/auth": "http://localhost:4000",
            "/ai": "http://localhost:4000",
            "/interviews": "http://localhost:4000",
            "/dashboard": "http://localhost:4000",
            "/health": "http://localhost:4000",
          },
    },
  };
});
