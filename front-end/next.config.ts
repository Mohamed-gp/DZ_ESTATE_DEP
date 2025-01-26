import nextI18nConfig from "./next-i18next.config";
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
 
    images: {
        domains: ['www.gravatar.com','res.cloudinary.com'],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'www.gravatar.com',
          }
        ]
      },
    ...nextI18nConfig,
    
};

// const nextConfig: NextConfig = {
//   ...nextI18nConfig,
//   // other Next.js configurations
// };

export default nextConfig;
