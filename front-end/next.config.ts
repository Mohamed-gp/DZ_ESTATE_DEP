import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ['www.gravatar.com', 'res.cloudinary.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.gravatar.com',
            }
        ]
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config) => {
        config.resolve.fallback = { 
            fs: false, 
            net: false, 
            tls: false 
        };
        return config;
    },
    transpilePackages: ['react-i18next', 'i18next'],
};

export default nextConfig;