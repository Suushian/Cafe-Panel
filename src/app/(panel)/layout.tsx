import { redirect } from "next/navigation";
import PanelShell from "@/components/PanelShell";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { adminExists, verifySession } from "@/lib/auth";
import { ensureDailyBackup } from "@/lib/backup";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasAdmin = await adminExists();
  if (!hasAdmin) {
    redirect("/setup");
  }

  const sessionOk = await verifySession();
  if (!sessionOk) {
    redirect("/login");
  }

  await ensureDailyBackup();

  return (
    <>
      <PanelShell>{children}</PanelShell>
      <KeyboardShortcuts />
    </>
  );
}