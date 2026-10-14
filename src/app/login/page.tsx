import { redirect } from "next/navigation";
import Link from "next/link";
import { adminExists, verifySession } from "@/lib/auth";
import LoginForm from "./components/LoginForm";
import { Coffee, KeyRound, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const hasAdmin = await adminExists();
  if (!hasAdmin) {
    redirect("/setup");
  }

  const sessionOk = await verifySession();
  if (sessionOk) {
    redirect("/menu");
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
            <KeyRound size={26} strokeWidth={2} />
          </span>
          <h1 className="text-xl font-bold text-text mb-1">ورود به پنل</h1>
          <p className="text-sm text-text-muted max-w-xs leading-6">
            برای ادامه، رمز عبور مدیر را وارد کن.
          </p>
        </div>

        <LoginForm />

        <div className="flex items-center justify-center gap-3 mt-6 text-xs text-text-soft">
          <Link
            href="/welcome"
            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ArrowRight size={12} />
            <span>بازگشت به خوش‌آمد</span>
          </Link>
          <span className="w-1 h-1 rounded-full bg-text-soft opacity-40 shrink-0" aria-hidden="true" />
          <span className="inline-flex items-center gap-1">
            <Coffee size={12} />
            <span>Cafe Panel</span>
          </span>
        </div>
      </div>
    </main>
  );
}