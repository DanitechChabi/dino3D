import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vignettes des vidéos YouTube (prédications et directs)
    remotePatterns: [new URL("https://i.ytimg.com/vi/**")],
  },
  experimental: {
    serverActions: {
      // Photos envoyées depuis l'administration (déjà réduites dans le navigateur avant l'envoi)
      bodySizeLimit: "4mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
