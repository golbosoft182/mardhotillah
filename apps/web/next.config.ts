import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3102";

const apiUrlParsed = new URL(apiUrl);
const apiImagePattern: { protocol: "http" | "https"; hostname: string; port?: string } = {
  protocol: apiUrlParsed.protocol === "https:" ? "https" : "http",
  hostname: apiUrlParsed.hostname,
};
if (apiUrlParsed.port) apiImagePattern.port = apiUrlParsed.port;

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      // Alias /spmb → halaman pendaftaran di /ppdb (permanen, link lama tetap jalan)
      { source: "/spmb", destination: "/ppdb", permanent: true },
      { source: "/spmb/:path*", destination: "/ppdb/:path*", permanent: true },
    ];
  },
  images: {
    // unoptimized: optimizer Next.js berjalan di dalam container dan tidak selalu
    // bisa menjangkau host eksternal/localhost API. Matikan optimizasi agar gambar
    // dimuat langsung oleh browser. Di production (Vercel) boleh diaktifkan kembali.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "images.unsplash.com" },
      apiImagePattern,
    ],
  },
};

export default nextConfig;
