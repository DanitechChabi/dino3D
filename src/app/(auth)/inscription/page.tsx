import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { RegisterForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Inscription" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/espace-membre");
  return <RegisterForm />;
}
