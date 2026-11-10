import type { NextConfig } from "next";

// As chamadas ao backend FastAPI passam pelo Next (mesma origem), permitindo que o proxy
// verifique o cookie sigma_token e que o Axios envie o JWT como Bearer.
const backendUrl = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) return [];
    return [{ source: "/api/backend/:path*", destination: `${backendUrl}/:path*` }];
  },
};

export default nextConfig;
