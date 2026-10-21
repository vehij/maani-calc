import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n.ts";
import { DEFAULT_USD_RATE, PRESETS } from "@/lib/presets.ts";
import { Calculator } from "@/components/Calculator.tsx";

// Studio parameters are read on the server and sent only to signed-in visitors
// (the proxy guards this page), so they never ship in a public JS bundle.
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const presets = Object.fromEntries(
    Object.entries(PRESETS).map(([k, v]) => [k, { params: v.params, defaultMinutes: v.defaultMinutes }]),
  ) as Parameters<typeof Calculator>[0]["presets"];
  return <Calculator lang={lang} presets={presets} defaultRate={DEFAULT_USD_RATE} />;
}
