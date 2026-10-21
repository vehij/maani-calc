import type { Lang } from "./i18n.ts";

const intCache = new Map<string, Intl.NumberFormat>();
function nf(locale: string, digits: number) {
  const key = `${locale}:${digits}`;
  let f = intCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
    intCache.set(key, f);
  }
  return f;
}

const locale = (lang: Lang) => (lang === "fa" ? "fa-IR" : "en-US");

export function num(lang: Lang, v: number, digits = 0): string {
  return nf(locale(lang), digits).format(v);
}

/** A money amount in the language's currency: Toman for Persian, dollars for English. */
export function money(lang: Lang, toman: number, usdRate: number): string {
  if (lang === "fa") return num("fa", Math.round(toman));
  return "$" + num("en", Math.round(usdRate > 0 ? toman / usdRate : 0));
}

/** Short form, e.g. «۱۰٫۲ میلیارد» or "$39.2K". */
export function moneyShort(lang: Lang, toman: number, usdRate: number): { value: string; unit: string } {
  if (lang === "fa") {
    const abs = Math.abs(toman);
    if (abs >= 1e9) return { value: num("fa", toman / 1e9, abs >= 1e11 ? 0 : 1), unit: "میلیارد تومان" };
    if (abs >= 1e6) return { value: num("fa", toman / 1e6, abs >= 1e8 ? 0 : 1), unit: "میلیون تومان" };
    return { value: num("fa", toman), unit: "تومان" };
  }
  const usd = usdRate > 0 ? toman / usdRate : 0;
  const abs = Math.abs(usd);
  if (abs >= 1e6) return { value: "$" + num("en", usd / 1e6, 2) + "M", unit: "USD" };
  if (abs >= 1e4) return { value: "$" + num("en", usd / 1e3, 1) + "K", unit: "USD" };
  return { value: "$" + num("en", usd), unit: "USD" };
}

export function currencyUnit(lang: Lang): string {
  return lang === "fa" ? "تومان" : "USD";
}

export function days(lang: Lang, v: number): string {
  return num(lang, v, Number.isInteger(Math.round(v * 10) / 10) ? 0 : 1);
}

export function pct(lang: Lang, v: number): string {
  return lang === "fa" ? `٪${num("fa", v * 100)}` : `${num("en", v * 100)}%`;
}

export function longDate(lang: Lang, d: Date): string {
  return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR-u-ca-persian" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** Parses user input that may contain Persian/Arabic digits and separators. */
export function parseNumber(input: string): number {
  const western = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[٫]/g, ".")
    .replace(/[^\d.]/g, "");
  const n = parseFloat(western);
  return Number.isFinite(n) ? n : 0;
}
