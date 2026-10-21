"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { estimate, type EngineParams, type Estimate, type PhaseKey, type Scenario } from "@/lib/engine.ts";
import { DICTS, type Dict, type Lang } from "@/lib/i18n.ts";
import { PROJECT_TYPES, type ProjectType } from "@/lib/presets.ts";
import { currencyUnit, days, money, moneyShort, num, parseNumber, pct } from "@/lib/format.ts";
import { Brand } from "./Brand.tsx";
import { ArrowIcon } from "./LoginForm.tsx";
import { FilmStack } from "./Illustrations.tsx";
import { DayGrid, MIX_COLORS, MixBars, PHASE_COLORS, PhaseArcs, SpendCurve } from "./Charts.tsx";
import { Report } from "./Report.tsx";

type Presets = Record<ProjectType, { params: EngineParams; defaultMinutes: number }>;
type Scenarios = [Scenario, Scenario, Scenario];

const STORAGE_KEY = "maani-calc:v1";
const PHASES: PhaseKey[] = ["pre", "prod", "post"];
const MINUTE_CHIPS = [10, 30, 60, 90, 120];

interface Saved {
  type: ProjectType;
  minutes: number;
  usdRate: number;
  scenario: number;
  custom: Partial<Record<ProjectType, Scenarios>>;
  projectName: string;
  clientName: string;
}

export function Calculator({ lang, presets, defaultRate }: { lang: Lang; presets: Presets; defaultRate: number }) {
  const t = DICTS[lang];
  const [type, setType] = useState<ProjectType>("film");
  const [minutes, setMinutes] = useState(presets.film.defaultMinutes);
  const [usdRate, setUsdRate] = useState(defaultRate);
  const [scenarioIdx, setScenarioIdx] = useState(1);
  const [custom, setCustom] = useState<Partial<Record<ProjectType, Scenarios>>>({});
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Restore the last session's inputs (per browser only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<Saved>;
        if (s.type && PROJECT_TYPES.includes(s.type)) setType(s.type);
        if (typeof s.minutes === "number" && s.minutes > 0) setMinutes(s.minutes);
        if (typeof s.usdRate === "number" && s.usdRate > 0) setUsdRate(s.usdRate);
        if (typeof s.scenario === "number" && s.scenario >= 0 && s.scenario <= 2) setScenarioIdx(s.scenario);
        if (s.custom && typeof s.custom === "object") setCustom(s.custom);
        if (typeof s.projectName === "string") setProjectName(s.projectName);
        if (typeof s.clientName === "string") setClientName(s.clientName);
      }
    } catch {
      // storage unavailable — start from defaults
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const s: Saved = { type, minutes, usdRate, scenario: scenarioIdx, custom, projectName, clientName };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // ignore
    }
  }, [loaded, type, minutes, usdRate, scenarioIdx, custom, projectName, clientName]);

  const params = presets[type].params;
  const scenarios: Scenarios = custom[type] ?? params.scenarios;
  const isCustom = !!custom[type];

  const all = useMemo(
    () => scenarios.map((sc) => estimate(params, { minutes, usdRate, scenario: sc })) as [Estimate, Estimate, Estimate],
    [params, scenarios, minutes, usdRate],
  );
  const est = all[scenarioIdx];

  function updateScenario(field: keyof Scenario, value: number) {
    const next = scenarios.map((s, i) => (i === scenarioIdx ? { ...s, [field]: value } : s)) as Scenarios;
    setCustom({ ...custom, [type]: next });
  }

  function resetScenarios() {
    const next = { ...custom };
    delete next[type];
    setCustom(next);
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    window.location.assign(`/${lang}/login`);
  }

  async function downloadPdf() {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      // let the hidden report render with the latest numbers
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await document.fonts.ready;
      const root = reportRef.current;
      if (!root) return;
      const [{ toJpeg, getFontEmbedCSS }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      const pages = Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-page]"));
      const fontEmbedCSS = await getFontEmbedCSS(pages[0]);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
      for (let i = 0; i < pages.length; i++) {
        const img = await toJpeg(pages[i], {
          quality: 0.94,
          pixelRatio: 2.4,
          backgroundColor: "#ffffff",
          fontEmbedCSS,
          cacheBust: false,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }
      pdf.setProperties({ title: `${t.report} — ${projectName || t.untitled}`, creator: t.studio });
      const safe = (projectName || "estimate").replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 60) || "estimate";
      const url = URL.createObjectURL(pdf.output("blob"));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${lang === "fa" ? "برآورد هزینه" : "Maani Estimate"} - ${safe}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      console.error(err);
      alert(lang === "fa" ? "ساخت PDF با خطا روبه‌رو شد. دوباره تلاش کنید." : "Could not create the PDF. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  }

  const short = moneyShort(lang, est.total, usdRate);
  const perMin = moneyShort(lang, est.perMinute, usdRate);
  const aiShare = est.total > 0 ? est.platform / est.total : 0;
  const other = lang === "fa" ? "en" : "fa";

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-12">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between gap-3">
        <Brand t={t} />
        <div className="flex items-center gap-2">
          <Link
            href={`/${other}`}
            lang={other}
            className="rounded-full bg-card px-4 py-2 text-sm text-ink-2 transition hover:bg-white/70"
          >
            {t.switchLang}
          </Link>
          <button
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted transition hover:text-ink"
            aria-label={t.logout}
            title={t.logout}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="rtl:-scale-x-100">
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Inputs */}
        <aside className="lg:col-span-4 xl:col-span-4">
          <div className="card rise p-5 sm:p-7 lg:sticky lg:top-5">
            <div className="mb-6 flex items-center gap-3">
              <IconChip>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
                </svg>
              </IconChip>
              <h2 className="text-[22px] font-light">{t.inputs}</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <TextField label={t.projectName} value={projectName} onChange={setProjectName} placeholder={t.projectNamePh} />
              <TextField label={t.clientName} value={clientName} onChange={setClientName} placeholder={t.clientNamePh} />
            </div>

            <Field label={t.projectType} className="mt-5">
              <div className="grid grid-cols-3 gap-1 rounded-full bg-canvas p-1">
                {PROJECT_TYPES.map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setType(k);
                    }}
                    className={`h-10 rounded-full text-[14px] transition ${
                      type === k ? "bg-ink text-white shadow-sm" : "text-ink-2 hover:bg-white/60"
                    }`}
                    aria-pressed={type === k}
                  >
                    {t.types[k]}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t.duration} className="mt-5">
              <div className="flex items-end justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <NumberInput
                    lang={lang}
                    value={minutes}
                    onChange={(v) => setMinutes(Math.max(1, Math.min(600, v)))}
                    className="w-[4.2ch] text-[44px] font-light leading-none"
                    ariaLabel={t.duration}
                  />
                  <span className="text-[14px] text-muted">{t.minutes}</span>
                </div>
                <div className="flex gap-1.5">
                  <StepButton onClick={() => setMinutes((m) => Math.max(1, m - 5))} label="−5" />
                  <StepButton onClick={() => setMinutes((m) => Math.min(600, m + 5))} label="+5" />
                </div>
              </div>
              <Slider value={minutes} min={1} max={300} onChange={setMinutes} lang={lang} />
              <div className="mt-1 flex flex-wrap gap-1.5">
                {MINUTE_CHIPS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMinutes(m)}
                    className={`rounded-full px-3 py-1 text-[12px] transition ${
                      minutes === m ? "bg-teal text-white" : "bg-canvas text-ink-2 hover:bg-teal-soft"
                    }`}
                  >
                    {num(lang, m)} {t.minuteShort}
                  </button>
                ))}
              </div>
            </Field>

            {lang === "fa" && (
              <RateField t={t} lang={lang} value={usdRate} onChange={setUsdRate} className="mt-5" />
            )}

            <Field label={t.scenario} className="mt-5">
              <div className="grid gap-2">
                {scenarios.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => setScenarioIdx(i)}
                    aria-pressed={scenarioIdx === i}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-start transition ${
                      scenarioIdx === i ? "border-teal bg-teal-soft/60" : "border-line hover:border-muted/40"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] ${
                        scenarioIdx === i ? "bg-teal text-white" : "bg-canvas text-ink-2"
                      }`}
                    >
                      {num(lang, i + 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium">{t.scenarios[i]}</span>
                      <span className="block truncate text-[12px] text-muted">{t.scenarioNotes[i]}</span>
                    </span>
                    <span className="shrink-0 text-end text-[12px] text-muted">
                      <span className="block text-[15px] text-ink">{num(lang, sc.pace, 1)}</span>
                      {t.perDay}
                    </span>
                  </button>
                ))}
              </div>
            </Field>

            <details className="group mt-5 rounded-2xl bg-canvas/70 p-4 open:bg-canvas">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] text-ink-2">
                {t.advanced}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition group-open:rotate-180">
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="mt-4 grid gap-3">
                {lang === "en" && <RateField t={t} lang={lang} value={usdRate} onChange={setUsdRate} />}
                <div className="text-[12px] text-muted">
                  {t.scenario}: <span className="text-ink-2">{t.scenarios[scenarioIdx]}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniNumber lang={lang} label={`${t.pace} (${t.perDay})`} value={scenarios[scenarioIdx].pace} step={0.5} min={0.5} onChange={(v) => updateScenario("pace", v)} />
                  <MiniNumber lang={lang} label={t.preDays} value={scenarios[scenarioIdx].preDays} min={0} onChange={(v) => updateScenario("preDays", v)} />
                  <MiniNumber lang={lang} label={t.postDays} value={scenarios[scenarioIdx].postDays} min={0} onChange={(v) => updateScenario("postDays", v)} />
                </div>
                {isCustom && (
                  <button onClick={resetScenarios} className="justify-self-start text-[12px] text-teal underline-offset-4 hover:underline">
                    {t.reset}
                  </button>
                )}
              </div>
            </details>
          </div>
        </aside>

        {/* Results */}
        <section className="grid content-start gap-4 lg:col-span-8 lg:gap-5" aria-live="polite">
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            <Kpi label={t.perMinute} value={perMin.value} unit={perMin.unit} />
            <Kpi label={t.calendarDays} value={days(lang, est.calendarDays)} unit={t.daysUnit} />
            <Kpi label={t.peakCrew} value={num(lang, est.peakHeadcount)} unit={t.people} />
            <Kpi label={t.aiShare} value={pct(lang, aiShare)} unit="" />
          </div>

          {/* Hero */}
          <div className="card rise relative overflow-hidden p-6 sm:p-8">
            <div
              className="pointer-events-none absolute inset-y-0 end-0 w-[70%] sm:w-[55%]"
              style={{
                background:
                  "radial-gradient(60% 65% at 55% 45%, rgba(242,105,44,0.26), rgba(242,105,44,0.07) 55%, transparent 78%)",
              }}
            />
            <FilmStack className="pointer-events-none absolute -end-6 top-2 w-[46%] max-w-[330px] opacity-95 sm:end-2 sm:top-0 sm:w-[40%]" />
            <div className="relative max-w-[62%] sm:max-w-[60%]">
              <div className="text-[13px] text-muted sm:text-[14px]">
                {t.estimateFor} {t.types[type]} · {num(lang, minutes)} {t.minutes}
              </div>
              <h1 className="mt-2 truncate text-[26px] font-light leading-tight tracking-tight sm:text-[40px]">
                {projectName || t.totalCost}
              </h1>
            </div>
            <div className="relative mt-6 sm:mt-10">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="tnum text-[40px] font-light leading-none tracking-tight sm:text-[64px]">{short.value}</span>
                <span className="text-[15px] text-muted sm:text-[17px]">{short.unit}</span>
              </div>
              <div className="tnum mt-2 text-[13px] text-muted">
                {money(lang, est.total, usdRate)} {currencyUnit(lang)}
                {lang === "fa" && (
                  <span className="ms-2 inline-block rounded-full bg-canvas px-2 py-0.5 text-[12px]">
                    ≈ {num("fa", Math.round(est.totalUsd))} دلار
                  </span>
                )}
              </div>
            </div>
            <div className="relative mt-7 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5 rtl:space-x-reverse">
                  {PHASES.map((k) => (
                    <span
                      key={k}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white text-[11px] font-medium text-white"
                      style={{ background: k === "pre" ? "#9aa1a9" : PHASE_COLORS[k] }}
                    >
                      {num(lang, est.phases[k].headcount)}
                    </span>
                  ))}
                </div>
                <div className="leading-tight">
                  <div className="text-[20px] font-light">
                    {num(lang, est.peakHeadcount)} <span className="text-[13px] text-muted">{t.people}</span>
                  </div>
                  <div className="text-[12px] text-muted">{t.peakCrew}</div>
                </div>
              </div>
              <PdfButton onClick={downloadPdf} busy={pdfBusy} t={t} className="hidden sm:flex" />
            </div>
          </div>

          {/* Cost mix + timeline */}
          <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
            <div className="card rise p-6 sm:p-7">
              <CardTitle icon={<CoinsIcon />} title={t.costMix} />
              <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
                <span>{t.costMixLead}</span>
                <span>{pct(lang, aiShare)} AI</span>
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="tnum text-[38px] font-light leading-none">{short.value}</span>
                <span className="text-[13px] text-muted">{short.unit}</span>
              </div>
              <div className="mt-6">
                <MixBars
                  segments={[
                    { value: est.platform, color: MIX_COLORS.platform },
                    { value: est.crew, color: MIX_COLORS.crew },
                    { value: est.overhead, color: MIX_COLORS.overhead },
                  ]}
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <MixLegend lang={lang} color={MIX_COLORS.platform} label={t.platform} value={est.platform} total={est.total} rate={usdRate} />
                <MixLegend lang={lang} color={MIX_COLORS.crew} label={t.crew} value={est.crew} total={est.total} rate={usdRate} />
                <MixLegend lang={lang} color={MIX_COLORS.overhead} label={t.overhead} value={est.overhead} total={est.total} rate={usdRate} />
              </div>
            </div>

            <div className="card rise flex flex-col p-6 sm:p-7">
              <CardTitle icon={<HourglassIcon />} title={t.timeline} />
              <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
                <span>{t.timelineLead}</span>
              </div>
              <SpendCurve est={est} className="mt-4 h-[150px] w-full rtl:-scale-x-100 sm:h-[170px]" />
              <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                <div className="flex items-baseline gap-2">
                  <span className="tnum text-[48px] font-light leading-none">{days(lang, est.workDays)}</span>
                  <span className="text-[13px] text-muted">{t.workDays}</span>
                </div>
                <div className="text-end text-[12px] text-muted">
                  <div className="text-[15px] text-ink">
                    {days(lang, est.calendarDays)} {t.daysUnit}
                  </div>
                  {t.onCalendar}
                </div>
              </div>
            </div>
          </div>

          {/* Phases + day grid */}
          <div className="grid gap-4 md:grid-cols-[1fr_1.5fr] lg:gap-5">
            <div className="card rise p-6 sm:p-7">
              <CardTitle icon={<LayersIcon />} title={t.phasesTitle} />
              <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
                <span>
                  <span className="text-[17px] text-ink">{days(lang, est.workDays)}</span> {t.workDays}
                </span>
              </div>
              <PhaseArcs est={est} className="mt-6 w-full rtl:-scale-x-100" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PHASES.map((k) => (
                  <div key={k}>
                    <div className="tnum text-[20px] font-light sm:text-[22px]">
                      {days(lang, est.phases[k].days)} <span className="text-[13px] text-muted">{t.daysUnit}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
                      <Dot color={PHASE_COLORS[k]} />
                      {t.phases[k]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rise flex flex-col p-6 sm:p-7">
              <div className="grid gap-6 sm:grid-cols-[1fr_1.15fr]">
                <div className="flex flex-col">
                  <h3 className="text-[26px] font-light leading-tight sm:text-[32px]">{t.scheduleTitle}</h3>
                  <p className="mt-3 text-[14px] leading-6 text-muted">{t.scheduleLead}</p>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
                    {PHASES.map((k) => (
                      <span key={k} className="flex items-center gap-1.5">
                        <Dot color={k === "pre" ? "#d5d9dd" : PHASE_COLORS[k]} square />
                        {t.phases[k]}
                      </span>
                    ))}
                  </div>
                </div>
                <DayGrid est={est} />
              </div>
              <div className="mt-6 flex items-end justify-between gap-3">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => setScenarioIdx(i)}
                      aria-pressed={scenarioIdx === i}
                      aria-label={t.scenarios[i]}
                      title={t.scenarios[i]}
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-[14px] transition sm:h-14 sm:w-14 ${
                        scenarioIdx === i ? "bg-teal text-white" : "bg-teal-soft text-ink-2 hover:bg-teal/20"
                      }`}
                    >
                      {num(lang, i + 1)}
                    </button>
                  ))}
                </div>
                <div className="text-end">
                  <span className="tnum text-[44px] font-light leading-none sm:text-[56px]">{pct(lang, aiShare)}</span>
                  <div className="text-[12px] text-muted">{t.ofBudgetOnAi}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="card rise p-6 sm:p-7">
            <CardTitle icon={<TableIcon />} title={t.breakdownTitle} />
            <div className="-mx-2 mt-5 overflow-x-auto px-2">
              <table className="w-full min-w-[560px] text-[14px]">
                <thead>
                  <tr className="text-start text-[12px] text-muted">
                    <th className="pb-3 text-start font-normal">{t.phasesTitle}</th>
                    <th className="pb-3 text-start font-normal">{t.days}</th>
                    <th className="pb-3 text-start font-normal">{t.team}</th>
                    <th className="pb-3 text-start font-normal">{t.dailyCost}</th>
                    <th className="pb-3 text-end font-normal">{t.phaseTotal}</th>
                  </tr>
                </thead>
                <tbody className="tnum">
                  {PHASES.map((k) => {
                    const ph = est.phases[k];
                    return (
                      <tr key={k} className="border-t border-line">
                        <td className="py-3.5">
                          <span className="flex items-center gap-2">
                            <Dot color={k === "pre" ? "#9aa1a9" : PHASE_COLORS[k]} />
                            {t.phases[k]}
                          </span>
                        </td>
                        <td className="py-3.5">{days(lang, ph.days)}</td>
                        <td className="py-3.5">{num(lang, ph.headcount)}</td>
                        <td className="py-3.5 text-ink-2">{money(lang, ph.daily.total, usdRate)}</td>
                        <td className="py-3.5 text-end">{money(lang, ph.total, usdRate)}</td>
                      </tr>
                    );
                  })}
                  <tr className="border-t border-ink/80 font-medium">
                    <td className="py-3.5">{t.total}</td>
                    <td className="py-3.5">{days(lang, est.workDays)}</td>
                    <td className="py-3.5">{num(lang, est.peakHeadcount)}</td>
                    <td className="py-3.5" />
                    <td className="py-3.5 text-end">
                      {money(lang, est.total, usdRate)} <span className="text-[12px] font-normal text-muted">{currencyUnit(lang)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Scenario comparison */}
          <div className="card rise p-6 sm:p-7">
            <CardTitle icon={<CompareIcon />} title={t.compareTitle} />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {all.map((e, i) => {
                const s = moneyShort(lang, e.total, usdRate);
                const pm = moneyShort(lang, e.perMinute, usdRate);
                const active = i === scenarioIdx;
                return (
                  <button
                    key={i}
                    onClick={() => setScenarioIdx(i)}
                    className={`rounded-[22px] p-5 text-start transition ${
                      active ? "bg-ink text-white" : "bg-canvas hover:bg-teal-soft"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px]">{t.scenarios[i]}</span>
                      {active && <span className="rounded-full bg-orange px-2 py-0.5 text-[11px] text-white">{t.selected}</span>}
                    </div>
                    <div className={`mt-1 text-[12px] ${active ? "text-white/60" : "text-muted"}`}>
                      {num(lang, e.scenario.pace, 1)} {t.perDay}
                    </div>
                    <div className="tnum mt-5 flex items-baseline gap-1.5">
                      <span className="text-[30px] font-light leading-none">{s.value}</span>
                      <span className={`text-[12px] ${active ? "text-white/60" : "text-muted"}`}>{s.unit}</span>
                    </div>
                    <div className={`tnum mt-3 grid grid-cols-2 gap-2 text-[12px] ${active ? "text-white/70" : "text-muted"}`}>
                      <span>
                        {days(lang, e.workDays)} {t.workDays}
                      </span>
                      <span className="text-end">
                        {pm.value} {pm.unit} / {t.minuteShort}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile sticky total + PDF */}
      <div className="fixed inset-x-0 bottom-0 z-20 p-3 sm:hidden" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between gap-3 rounded-full bg-white/90 p-2 ps-5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur">
          <div className="min-w-0 leading-tight">
            <div className="text-[11px] text-muted">{t.totalCost}</div>
            <div className="tnum truncate text-[17px]">
              {short.value} <span className="text-[11px] text-muted">{short.unit}</span>
            </div>
          </div>
          <PdfButton onClick={downloadPdf} busy={pdfBusy} t={t} compact />
        </div>
      </div>

      {/* Off-screen PDF source */}
      {pdfBusy && (
        <div aria-hidden="true" style={{ position: "fixed", top: 0, left: -20000, pointerEvents: "none" }}>
          <div ref={reportRef}>
            <Report
              lang={lang}
              est={est}
              all={all}
              scenarioIdx={scenarioIdx}
              type={type}
              projectName={projectName}
              clientName={clientName}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small building blocks ---------- */

function PdfButton({
  onClick,
  busy,
  t,
  compact,
  className = "",
}: {
  onClick: () => void;
  busy: boolean;
  t: Dict;
  compact?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`group flex shrink-0 items-center gap-4 rounded-full bg-ink text-white transition disabled:opacity-70 ${
        compact ? "h-12 ps-5 pe-1.5 text-[14px]" : "h-14 ps-7 pe-2 text-[16px]"
      } ${className}`}
    >
      <span>{busy ? t.preparingPdf : t.downloadPdf}</span>
      <span
        className={`flex items-center justify-center rounded-full bg-white text-orange transition group-hover:scale-105 ${
          compact ? "h-9 w-9" : "h-10 w-10"
        }`}
      >
        {busy ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange border-t-transparent" />
        ) : (
          <ArrowIcon />
        )}
      </span>
    </button>
  );
}

function Kpi({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="card rise px-5 py-4 sm:px-6 sm:py-5">
      <div className="truncate text-[12px] text-muted sm:text-[13px]">{label}</div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className="tnum whitespace-nowrap text-[28px] font-light leading-none tracking-tight sm:text-[34px]">{value}</span>
        {unit && <span className="text-[12px] text-muted sm:text-[13px]">{unit}</span>}
      </div>
    </div>
  );
}

function CardTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <IconChip>{icon}</IconChip>
      <h3 className="text-[20px] font-light sm:text-[22px]">{title}</h3>
    </div>
  );
}

function IconChip({ children }: { children: React.ReactNode }) {
  return <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-canvas text-ink-2">{children}</span>;
}

function Dot({ color, square }: { color: string; square?: boolean }) {
  return <span className={`inline-block h-2.5 w-2.5 shrink-0 ${square ? "rounded-[3px]" : "rounded-full"}`} style={{ background: color }} />;
}

function MixLegend({
  lang,
  color,
  label,
  value,
  total,
  rate,
}: {
  lang: Lang;
  color: string;
  label: string;
  value: number;
  total: number;
  rate: number;
}) {
  const s = moneyShort(lang, value, rate);
  return (
    <div className="min-w-0">
      <div className="tnum flex items-baseline gap-1">
        <span className="text-[19px] font-light sm:text-[21px]">{s.value}</span>
        <span className="truncate text-[10px] text-muted">{lang === "fa" ? s.unit.split(" ")[0] : s.unit}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
        <Dot color={color} />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-0.5 text-[11px] text-muted">{pct(lang, total > 0 ? value / total : 0)}</div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-2 text-[13px] text-muted">{label}</div>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={80}
        className="h-12 w-full rounded-2xl border border-transparent bg-canvas/70 px-4 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-teal focus:bg-white"
      />
    </label>
  );
}

function NumberInput({
  lang,
  value,
  onChange,
  className = "",
  ariaLabel,
  digits = 0,
}: {
  lang: Lang;
  value: number;
  onChange: (v: number) => void;
  className?: string;
  ariaLabel?: string;
  digits?: number;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      inputMode="decimal"
      aria-label={ariaLabel}
      value={draft ?? num(lang, value, digits)}
      onFocus={(e) => {
        setDraft(num(lang, value, digits));
        requestAnimationFrame(() => e.target.select());
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        const v = parseNumber(e.target.value);
        if (v > 0) onChange(v);
      }}
      onBlur={() => setDraft(null)}
      className={`tnum bg-transparent outline-none ${className}`}
    />
  );
}

function RateField({
  t,
  lang,
  value,
  onChange,
  className = "",
}: {
  t: Dict;
  lang: Lang;
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-2 text-[13px] text-muted">{t.usdRate}</div>
      <div className="flex h-14 items-center gap-2 rounded-2xl border border-transparent bg-canvas/70 px-4 transition focus-within:border-teal focus-within:bg-white">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-soft text-[13px] text-teal-deep">$</span>
        <NumberInput lang={lang} value={value} onChange={(v) => onChange(Math.round(v))} className="w-full text-[20px]" ariaLabel={t.usdRate} />
        <span className="shrink-0 text-[13px] text-muted">{t.toman}</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-5 text-muted">{t.usdRateHint}</p>
    </div>
  );
}

function MiniNumber({
  lang,
  label,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  lang: Lang;
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="rounded-xl bg-white p-2.5">
      <div className="h-8 text-[10.5px] leading-4 text-muted">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-1">
        <button className="h-7 w-7 rounded-lg bg-canvas text-ink-2" onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} aria-label="−">
          −
        </button>
        <span className="tnum text-[15px]">{num(lang, value, 1)}</span>
        <button className="h-7 w-7 rounded-lg bg-canvas text-ink-2" onClick={() => onChange(+(value + step).toFixed(2))} aria-label="+">
          +
        </button>
      </div>
    </div>
  );
}

function StepButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="h-9 min-w-11 rounded-full bg-canvas px-3 text-[13px] text-ink-2 transition hover:bg-teal-soft" dir="ltr">
      {label}
    </button>
  );
}

function Slider({
  value,
  min,
  max,
  onChange,
  lang,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  lang: Lang;
}) {
  const fill = ((Math.min(value, max) - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      className="slider mt-3"
      min={min}
      max={max}
      value={Math.min(value, max)}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ ["--fill" as string]: `${fill}%`, ["--fill-dir" as string]: lang === "fa" ? "left" : "right" }}
    />
  );
}

/* ---------- icons ---------- */

function CoinsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <ellipse cx="9" cy="7" rx="5" ry="2.5" />
      <path d="M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7" />
      <ellipse cx="15" cy="14" rx="5" ry="2.5" />
      <path d="M10 14v3c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-3" />
    </svg>
  );
}
function HourglassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" />
    </svg>
  );
}
function LayersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}
function TableIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M3 15h18M9 10v10" />
    </svg>
  );
}
function CompareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 20V10M12 20V4M18 20v-7" strokeLinecap="round" />
    </svg>
  );
}
