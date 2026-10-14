import { Database } from "lucide-react";
import { getLastBackup } from "@/lib/backup";

export default async function BackupIndicator() {
  const last = await getLastBackup();

  return (
    <div className="card flex items-center gap-3 mt-6 animate-fade-up">
      <span className="flex items-center justify-center w-9 h-9 rounded-card-sm bg-primary/10 text-primary shrink-0">
        <Database size={16} strokeWidth={2.2} />
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-text-muted">آخرین نسخه‌ی پشتیبان</span>
        <span className="text-sm text-text">
          {last
            ? `${last.date} — ${(last.sizeBytes / 1024).toLocaleString("fa-IR", { maximumFractionDigits: 0 })} کیلوبایت`
            : "هنوز پشتیبانی ساخته نشده است"}
        </span>
      </div>
    </div>
  );
}