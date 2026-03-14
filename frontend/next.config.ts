import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function buildRemotePattern(url: string) {
  try {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: "/uploads/**",
    };
  } catch {
    return {
      protocol: "http" as const,
      hostname: "localhost",
      port: "4000",
      pathname: "/uploads/**",
    };
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [buildRemotePattern(apiUrl)],
  },
};

export default nextConfig;
