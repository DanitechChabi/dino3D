import type { MetadataRoute } from "next";
import { church } from "@/content/site";

// Permet d'installer le site comme une application (nécessaire aux notifications sur iPhone).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${church.name} — ${church.city}`,
    short_name: "EBB-JR",
    description: church.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#04081a",
    theme_color: "#04081a",
    lang: "fr",
    icons: [
      { src: "/brand/logo-ebb-jr-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/logo-ebb-jr-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/logo-ebb-jr-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
