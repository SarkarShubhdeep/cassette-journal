import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    devIndicators: false,
    images: {
        unoptimized: true,
        domains: ["github.com"],
    },
};

export default nextConfig;
