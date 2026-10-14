import type { Metadata } from "next";
import "@fontsource/vazirmatn/300.css";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "@fontsource/vazirmatn/900.css";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import ThemeScript from "@/components/ThemeScript";
import AmbientBackground from "@/components/AmbientBackground";

export const metadata: Metadata = {
  title: "Cafe Panel",
  description: "پنل مدیریت کافه",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AmbientBackground />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}