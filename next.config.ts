import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vignettes des vidéos YouTube (prédications et directs)
    remotePatterns: [new URL("https://i.ytimg.com/vi/**")],
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
