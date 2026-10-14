import { redirect } from "next/navigation";
import { adminExists } from "@/lib/auth";
import SetupForm from "./components/SetupForm";
import { Coffee, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const exists = await adminExists();
  if (exists) {
    redirect("/login");
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden p-6">
      <div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(200,149,107,0.6) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(111,78,55,0.55) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative card w-full max-w-md animate-fade-up">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-3">
            <ShieldCheck size={26} strokeWidth={2} />
          </span>
          <h1 className="text-xl font-bold text-text mb-1">
            راه‌اندازی اولیه
          </h1>
          <p className="text-sm text-text-muted max-w-xs leading-6">
            برای شروع، یک رمز عبور برای مدیر تعیین کن. این رمز برای ورود به
            پنل استفاده می‌شود.
          </p>
        </div>

        <SetupForm />

        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-text-soft">
          <Coffee size={12} />
          <span>Cafe Panel — نسخه‌ی MVP</span>
        </div>
      </div>
    </main>
  );
}