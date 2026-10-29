import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/motion/Preloader";
import { currentLive } from "@/lib/lives";
import { LiveBadge } from "@/components/live/LiveBadge";

// Pages publiques pré-générées et servies depuis le CDN, régénérées au plus toutes les 5 minutes
// (et aussitôt après une modification depuis l'administration). Les pages personnelles restent dynamiques.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const live = await currentLive();
  return (
    <>
      <Preloader />
      <Header />
      <main>{children}</main>
      <Footer />
      {live && <LiveBadge title={live.title} />}
    </>
  );
}
