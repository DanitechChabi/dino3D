import { getCurrentUser, hasRole } from "@/lib/dal";

/** Identité du visiteur pour la barre de navigation (lue par le navigateur : les pages publiques restent statiques). */
export async function GET() {
  const user = await getCurrentUser();
  return Response.json(
    { user: user ? { firstName: user.firstName, isStaff: hasRole(user.role, "RESPONSABLE") } : null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
