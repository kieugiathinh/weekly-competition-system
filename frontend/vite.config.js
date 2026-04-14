import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Quản Lý Thi Đua THCS Trần Phú",
        short_name: "QLTĐ",
        description: "Phần mềm chấm điểm thi đua nội bộ",
        theme_color: "#2563EB",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "logothcstranphu.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logothcstranphu.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "logothcstranphu.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
