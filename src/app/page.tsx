import { redirect } from "next/navigation";
import { adminExists, verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const hasAdmin = await adminExists();
  if (!hasAdmin) {
    redirect("/setup");
  }

  const sessionOk = await verifySession();
  if (!sessionOk) {
    redirect("/login");
  }

  redirect("/dashboard");
}