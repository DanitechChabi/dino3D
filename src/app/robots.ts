import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Les espaces privés (administration, espace membre, reçus, paiements) ne sont pas indexés
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/espace-membre", "/recu/", "/donner/merci/", "/donner/simulation/", "/api/", "/connexion", "/inscription", "/changer-mot-de-passe", "/solidarite/demande"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
