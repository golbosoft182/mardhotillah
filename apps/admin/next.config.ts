import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3102";
// Naungan production: admin disajikan di sub-path /cms oleh Nginx reverse proxy.
// Kosongkan ADMIN_BASE_PATH untuk menjalankan admin di root (development/Docker lokal).
const basePath = process.env.ADMIN_BASE_PATH ?? "";

const apiUrlParsed = new URL(apiUrl);
const apiImagePattern: { protocol: "http" | "https"; hostname: string; port?: string } = {
  protocol: apiUrlParsed.protocol === "https:" ? "https" : "http",
  hostname: apiUrlParsed.hostname,
};
if (apiUrlParsed.port) apiImagePattern.port = apiUrlParsed.port;

const nextConfig: NextConfig = {
  output: "standalone",
  ...(basePath ? { basePath } : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "http", hostname: "localhost" },
      apiImagePattern,
    ],
  },
};

export default nextConfig;
