import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { NewPasswordForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (!user.mustChangePassword) redirect("/espace-membre");
  return <NewPasswordForm firstName={user.firstName} />;
}
