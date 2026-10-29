import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/motion/Preloader";
import { getCurrentUser, hasRole } from "@/lib/dal";
import { currentLive } from "@/lib/lives";
import { LiveBadge } from "@/components/live/LiveBadge";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, live] = await Promise.all([getCurrentUser(), currentLive()]);
  return (
    <>
      <Preloader />
      <Header user={user ? { firstName: user.firstName, isStaff: hasRole(user.role, "RESPONSABLE") } : null} />
      <main>{children}</main>
      <Footer />
      {live && <LiveBadge title={live.title} />}
    </>
  );
}
