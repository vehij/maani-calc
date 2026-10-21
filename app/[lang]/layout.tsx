import type { Metadata, Viewport } from "next";
import { Estedad, Lexend } from "next/font/google";
import { notFound } from "next/navigation";
import { DICTS, LANGS, isLang } from "@/lib/i18n.ts";
import "../globals.css";

const estedad = Estedad({
  subsets: ["arabic", "latin"],
  variable: "--font-estedad",
  adjustFontFallback: false,
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = DICTS[isLang(lang) ? lang : "fa"];
  return {
    title: `${t.appName} | ${t.studio}`,
    description: t.appName,
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#eef0f2",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} dir={DICTS[lang].dir} className={`${estedad.variable} ${lexend.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
