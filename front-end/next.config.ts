// import nextI18nConfig from "./next-i18next.config";
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
 
    images: {
        domains: ['www.gravatar.com','res.cloudinary.com','lh3.googleusercontent.com'],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'www.gravatar.com',
          }
        ]
      },
      eslint:{
        ignoreDuringBuilds:true,
      },
    typescript:{
      ignoreBuildErrors:true,
    }
    
};


export default nextConfig;
