import type { NextConfig } from "next";

// Quando o backend FastAPI estiver disponível, definir BACKEND_URL (ex.: http://localhost:8001)
// e NEXT_PUBLIC_API_URL=/api/backend. As chamadas passam pelo próprio Next (mesma origem),
// o que permite ao proxy.ts enxergar o cookie de sessão httpOnly emitido pela API.
const backendUrl = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    if (!backendUrl) return [];
    return [{ source: "/api/backend/:path*", destination: `${backendUrl}/:path*` }];
  },
};

export default nextConfig;
