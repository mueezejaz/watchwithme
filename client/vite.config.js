import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isProduction = process.env.npm_package_config_production === "true";

export default defineConfig({
  base: isProduction ? "/sync-watch/" : "/",
  plugins: [react(), tailwindcss()],
});
