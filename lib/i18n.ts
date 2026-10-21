import type { ProjectType } from "./presets.ts";
import type { PhaseKey } from "./engine.ts";

export type Lang = "fa" | "en";
export const LANGS: Lang[] = ["fa", "en"];

export function isLang(v: string): v is Lang {
  return (LANGS as string[]).includes(v);
}

const fa = {
  dir: "rtl" as "rtl" | "ltr",
  studio: "استودیو مانی",
  appName: "برآورد هزینه تولید با هوش مصنوعی",
  appShort: "ماشین‌حساب تولید",
  switchLang: "English",
  logout: "خروج",

  loginTitle: "ورود به ماشین‌حساب",
  loginLead: "برای دیدن برآورد هزینه تولید، رمز دسترسی استودیو را وارد کنید.",
  password: "رمز دسترسی",
  enter: "ورود",
  checking: "در حال بررسی…",
  wrongPassword: "رمز وارد شده درست نیست.",
  notConfigured: "رمز دسترسی هنوز روی سرور تنظیم نشده است.",
  networkError: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",

  inputs: "مشخصات پروژه",
  projectName: "نام پروژه",
  projectNamePh: "مثلاً: فیلم کوتاه «سیبیلوها»",
  clientName: "سفارش‌دهنده",
  clientNamePh: "اختیاری",
  projectType: "نوع پروژه",
  types: { film: "فیلم", animation: "انیمیشن", series: "سریال" } as Record<ProjectType, string>,
  duration: "زمان اثر",
  minutes: "دقیقه",
  minuteShort: "دقیقه",
  usdRate: "قیمت دلار",
  usdRateHint: "نرخ روز دلار به تومان؛ هزینه اکانت‌ها و کردیت‌های هوش مصنوعی با این نرخ محاسبه می‌شود.",
  toman: "تومان",
  scenario: "سناریوی تولید",
  scenarios: ["سریع", "متعادل", "پرجزئیات"],
  scenarioNotes: [
    "بیشترین خروجی روزانه و کوتاه‌ترین زمان",
    "توازن میان سرعت و کیفیت",
    "زمان بیشتر برای جزئیات و بازبینی",
  ],
  pace: "خروجی روزانه",
  perDay: "دقیقه در روز",
  advanced: "تنظیمات پیشرفته",
  preDays: "روزهای پیش‌تولید",
  postDays: "روزهای پس‌تولید",
  reset: "بازگشت به پیش‌فرض",

  totalCost: "هزینه کل پروژه",
  estimateFor: "برآورد برای",
  perMinute: "هزینه هر دقیقه",
  calendarDays: "مدت پروژه",
  workDays: "روز کاری",
  prodDays: "روزهای تولید",
  peakCrew: "اوج نیروی تیم",
  people: "نفر",
  aiShare: "سهم هوش مصنوعی",
  days: "روز",
  daysUnit: "روز",
  downloadPdf: "دانلود PDF",
  preparingPdf: "در حال ساخت PDF…",
  loading: "در حال آماده‌سازی ماشین‌حساب…",
  calculating: "در حال محاسبه…",
  updated: "به‌روز شد",
  pdfReady: "فایل PDF آماده و دانلود شد",
  pdfPage: (i: number, n: number) => `صفحه ${i.toLocaleString("fa-IR")} از ${n.toLocaleString("fa-IR")}`,

  costMix: "ترکیب هزینه",
  costMixLead: "تفکیک هزینه‌ها بر اساس نوع",
  platform: "اکانت و کردیت AI",
  crew: "دستمزد و تدارکات",
  overhead: "سربار و سود",
  ofTotal: "از کل",

  timeline: "زمان‌بندی",
  timelineLead: "روند انباشت هزینه در طول پروژه",
  onCalendar: "با هم‌پوشانی مراحل",

  phasesTitle: "مراحل تولید",
  phases: { pre: "پیش‌تولید", prod: "تولید", post: "پس‌تولید" } as Record<PhaseKey, string>,

  scheduleTitle: "نقشه روزهای کاری",
  scheduleLead: "هر خانه یک روز کاری است. سناریو را عوض کنید تا تغییر زمان و هزینه را ببینید.",
  ofBudgetOnAi: "از بودجه صرف هوش مصنوعی",

  breakdownTitle: "جزئیات هزینه هر مرحله",
  dailyCost: "هزینه روزانه",
  phaseTotal: "جمع مرحله",
  team: "نیرو",
  total: "جمع کل",

  compareTitle: "مقایسه سناریوها",
  selected: "انتخاب‌شده",

  report: "گزارش برآورد هزینه",
  reportNo: "شماره برآورد",
  date: "تاریخ",
  preparedFor: "سفارش‌دهنده",
  untitled: "پروژه بدون عنوان",
  assumptions: "مفروضات محاسبه",
  assumptionsList: (rate: string, pace: string) => [
    `نرخ دلار: ${rate} تومان`,
    `خروجی روزانه در مرحله تولید: ${pace} دقیقه`,
    "هزینه اکانت‌ها و کردیت‌ها بر پایه قیمت دلاری سرویس‌ها و نرخ روز محاسبه شده است.",
    "پیش‌بینی هزینه‌های پیش‌بینی‌نشده در هزینه اکانت‌ها لحاظ شده است.",
  ],
  disclaimer:
    "این سند یک برآورد اولیه است و مبلغ نهایی پس از بررسی فیلمنامه، سبک بصری و جزئیات فنی پروژه قطعی می‌شود. اعتبار این برآورد با توجه به نوسان نرخ ارز ۱۴ روز است.",
  page: "صفحه",
  summary: "خلاصه",
};

type Dict = typeof fa;

const en: Dict = {
  dir: "ltr",
  studio: "Maani Studio",
  appName: "AI Production Cost Estimator",
  appShort: "Production Calculator",
  switchLang: "فارسی",
  logout: "Sign out",

  loginTitle: "Sign in to the calculator",
  loginLead: "Enter the studio access password to open the production cost estimator.",
  password: "Access password",
  enter: "Sign in",
  checking: "Checking…",
  wrongPassword: "That password is not correct.",
  notConfigured: "The access password has not been configured on the server yet.",
  networkError: "Could not reach the server. Please try again.",

  inputs: "Project details",
  projectName: "Project name",
  projectNamePh: "e.g. Short film “Sibiloha”",
  clientName: "Client",
  clientNamePh: "Optional",
  projectType: "Project type",
  types: { film: "Film", animation: "Animation", series: "Series" },
  duration: "Runtime",
  minutes: "minutes",
  minuteShort: "min",
  usdRate: "Exchange rate",
  usdRateHint: "Toman per US dollar, used to convert local crew and logistics costs into USD.",
  toman: "IRT",
  scenario: "Production scenario",
  scenarios: ["Fast track", "Balanced", "High detail"],
  scenarioNotes: [
    "Highest daily output, shortest schedule",
    "A balance of speed and quality",
    "More time for detail and review",
  ],
  pace: "Daily output",
  perDay: "min / day",
  advanced: "Advanced settings",
  preDays: "Pre-production days",
  postDays: "Post-production days",
  reset: "Reset to defaults",

  totalCost: "Total project cost",
  estimateFor: "Estimate for",
  perMinute: "Cost per minute",
  calendarDays: "Project length",
  workDays: "work days",
  prodDays: "Production days",
  peakCrew: "Peak crew",
  people: "people",
  aiShare: "AI share",
  days: "days",
  daysUnit: "days",
  downloadPdf: "Download PDF",
  preparingPdf: "Preparing PDF…",
  loading: "Getting the calculator ready…",
  calculating: "Calculating…",
  updated: "Up to date",
  pdfReady: "Your PDF is ready and downloaded",
  pdfPage: (i: number, n: number) => `Page ${i} of ${n}`,

  costMix: "Cost mix",
  costMixLead: "Where the budget goes",
  platform: "AI accounts & credits",
  crew: "Crew & logistics",
  overhead: "Overhead & margin",
  ofTotal: "of total",

  timeline: "Timeline",
  timelineLead: "How spend accumulates over the project",
  onCalendar: "with phase overlap",

  phasesTitle: "Production phases",
  phases: { pre: "Pre-production", prod: "Production", post: "Post-production" },

  scheduleTitle: "Work-day map",
  scheduleLead: "Each square is one work day. Switch scenarios to see how time and cost move.",
  ofBudgetOnAi: "of budget spent on AI",

  breakdownTitle: "Cost by phase",
  dailyCost: "Daily cost",
  phaseTotal: "Phase total",
  team: "Crew",
  total: "Total",

  compareTitle: "Scenario comparison",
  selected: "Selected",

  report: "Production Cost Estimate",
  reportNo: "Estimate no.",
  date: "Date",
  preparedFor: "Prepared for",
  untitled: "Untitled project",
  assumptions: "Assumptions",
  assumptionsList: (_rate: string, pace: string) => [
    `Production output: ${pace} finished minutes per day`,
    "AI account and credit costs are based on current USD service pricing.",
    "A contingency for unforeseen generation costs is included in AI costs.",
    "All amounts are in US dollars.",
  ],
  disclaimer:
    "This document is a preliminary estimate. The final price is confirmed after reviewing the script, visual style and technical scope. Valid for 14 days due to exchange-rate volatility.",
  page: "Page",
  summary: "Summary",
};

export const DICTS: Record<Lang, Dict> = { fa, en };
export type { Dict };
