import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { LoginForm } from "@/components/forms/AuthForms";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage(props: PageProps<"/connexion">) {
  if (await getCurrentUser()) redirect("/espace-membre");
  const { suite } = await props.searchParams;
  return <LoginForm next={typeof suite === "string" ? suite : undefined} />;
}
