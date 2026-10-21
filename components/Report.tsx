import type { Estimate, PhaseKey } from "@/lib/engine.ts";
import { DICTS, type Lang } from "@/lib/i18n.ts";
import type { ProjectType } from "@/lib/presets.ts";
import { currencyUnit, days, longDate, money, moneyShort, num, pct } from "@/lib/format.ts";
import { LogoMark, Logotype } from "./Brand.tsx";
import { FilmStack } from "./Illustrations.tsx";
import { DayGrid, MIX_COLORS, MixBars, PHASE_COLORS, PhaseArcs } from "./Charts.tsx";

// A4 at 96 dpi. Each [data-pdf-page] is rasterised into one PDF page.
const PAGE_W = 794;
const PAGE_H = 1123;
const PHASES: PhaseKey[] = ["pre", "prod", "post"];

export function Report({
  lang,
  est,
  all,
  scenarioIdx,
  type,
  projectName,
  clientName,
}: {
  lang: Lang;
  est: Estimate;
  all: Estimate[];
  scenarioIdx: number;
  type: ProjectType;
  projectName: string;
  clientName: string;
}) {
  const t = DICTS[lang];
  const rate = est.usdRate;
  const now = new Date();
  const ref = `MS-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}-${Math.round(est.total / 1000) % 9000 + 1000}`;
  const short = moneyShort(lang, est.total, rate);
  const perMin = moneyShort(lang, est.perMinute, rate);
  const aiShare = est.total > 0 ? est.platform / est.total : 0;
  const font = lang === "fa" ? "var(--font-estedad), sans-serif" : "var(--font-lexend), sans-serif";

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <LogoMark size={38} />
        <div className="leading-tight">
          <Logotype height={16} className="block" />
          <div className="mt-1 text-[11px] text-muted">{t.appName}</div>
        </div>
      </div>
      <div className="text-end text-[11px] leading-5 text-muted">
        <div>
          {t.reportNo}: <span className="text-ink" dir="ltr">{ref}</span>
        </div>
        <div>
          {t.date}: <span className="text-ink">{longDate(lang, now)}</span>
        </div>
      </div>
    </div>
  );

  const footer = (page: number) => (
    <div className="absolute inset-x-[48px] bottom-[28px] flex items-end justify-between gap-6 border-t border-line pt-4 text-[10px] leading-[17px] text-muted">
      <p className="max-w-[560px]">{t.disclaimer}</p>
      <span className="shrink-0">
        {t.page} {num(lang, page)} / {num(lang, 2)}
      </span>
    </div>
  );

  const pageStyle = { width: PAGE_W, height: PAGE_H, fontFamily: font } as const;

  return (
    <div dir={t.dir} lang={lang} className="text-ink">
      {/* Page 1 */}
      <div data-pdf-page style={pageStyle} className="relative overflow-hidden bg-white px-[48px] pt-[44px]">
        {header}

        <div className="mt-7 text-[12px] text-muted">{t.report}</div>
        <h1 className="mt-1 text-[34px] font-light leading-tight tracking-tight">{projectName || t.untitled}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
          <Chip>{t.types[type]}</Chip>
          <Chip>
            {num(lang, est.minutes)} {t.minutes}
          </Chip>
          <Chip>
            {t.scenarios[scenarioIdx]} · {num(lang, est.scenario.pace, 1)} {t.perDay}
          </Chip>
          {clientName && (
            <Chip>
              {t.preparedFor}: {clientName}
            </Chip>
          )}
        </div>

        {/* Total */}
        <div className="relative mt-5 overflow-hidden rounded-[26px] bg-[#f4f5f6] p-7">
          <div
            className="absolute inset-y-0 end-0 w-[55%]"
            style={{
              background:
                "radial-gradient(60% 70% at 55% 50%, rgba(242,105,44,0.28), rgba(242,105,44,0.07) 55%, transparent 80%)",
            }}
          />
          <FilmStack className="absolute end-6 top-2 w-[200px]" />
          <div className="relative">
            <div className="text-[13px] text-muted">{t.totalCost}</div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-[64px] font-light leading-none tracking-tight">{short.value}</span>
              <span className="text-[16px] text-muted">{short.unit}</span>
            </div>
            <div className="mt-3 text-[13px] text-ink-2">
              {money(lang, est.total, rate)} {currencyUnit(lang)}
            </div>
            {lang === "fa" && (
              <div className="mt-1 text-[12px] text-muted">
                ≈ {num("fa", Math.round(est.totalUsd))} دلار · {t.usdRate} {num("fa", rate)} {t.toman}
              </div>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <Tile label={t.perMinute} value={perMin.value} unit={perMin.unit} />
          <Tile label={t.calendarDays} value={days(lang, est.calendarDays)} unit={t.daysUnit} />
          <Tile label={t.peakCrew} value={num(lang, est.peakHeadcount)} unit={t.people} />
          <Tile label={t.aiShare} value={pct(lang, aiShare)} unit="" />
        </div>

        {/* Cost mix */}
        <div className="mt-4 rounded-[22px] border border-line p-6">
          <div className="flex items-center justify-between">
            <div className="text-[17px] font-light">{t.costMix}</div>
            <div className="text-[11px] text-muted">{t.costMixLead}</div>
          </div>
          <div className="mt-4">
            <MixBars
              animate={false}
              count={48}
              height={54}
              segments={[
                { value: est.platform, color: MIX_COLORS.platform },
                { value: est.crew, color: MIX_COLORS.crew },
                { value: est.overhead, color: MIX_COLORS.overhead },
              ]}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {(
              [
                ["platform", t.platform],
                ["crew", t.crew],
                ["overhead", t.overhead],
              ] as const
            ).map(([k, label]) => (
              <div key={k}>
                <div className="text-[18px] font-light">
                  {money(lang, est[k], rate)} <span className="text-[10px] text-muted">{currencyUnit(lang)}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: MIX_COLORS[k] }} />
                  {label} · {pct(lang, est.total > 0 ? est[k] / est.total : 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase table */}
        <div className="mt-4 rounded-[22px] border border-line px-6 pb-2 pt-5">
          <div className="text-[17px] font-light">{t.breakdownTitle}</div>
          <table className="mt-3 w-full text-[12.5px]">
            <thead>
              <tr className="text-[11px] text-muted">
                <th className="pb-2 text-start font-normal">{t.phasesTitle}</th>
                <th className="pb-2 text-start font-normal">{t.days}</th>
                <th className="pb-2 text-start font-normal">{t.team}</th>
                <th className="pb-2 text-start font-normal">{t.dailyCost}</th>
                <th className="pb-2 text-end font-normal">{t.phaseTotal}</th>
              </tr>
            </thead>
            <tbody>
              {PHASES.map((k) => {
                const ph = est.phases[k];
                return (
                  <tr key={k} className="border-t border-line">
                    <td className="py-2.5">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: k === "pre" ? "#9aa1a9" : PHASE_COLORS[k] }} />
                        {t.phases[k]}
                      </span>
                    </td>
                    <td className="py-2.5">{days(lang, ph.days)}</td>
                    <td className="py-2.5">{num(lang, ph.headcount)}</td>
                    <td className="py-2.5 text-ink-2">{money(lang, ph.daily.total, rate)}</td>
                    <td className="py-2.5 text-end">{money(lang, ph.total, rate)}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-ink font-medium">
                <td className="py-2.5">{t.total}</td>
                <td className="py-2.5">{days(lang, est.workDays)}</td>
                <td className="py-2.5">{num(lang, est.peakHeadcount)}</td>
                <td className="py-2.5" />
                <td className="py-2.5 text-end">
                  {money(lang, est.total, rate)} <span className="text-[10px] font-normal text-muted">{currencyUnit(lang)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {footer(1)}
      </div>

      {/* Page 2 */}
      <div data-pdf-page style={pageStyle} className="relative overflow-hidden bg-white px-[48px] pt-[44px]">
        {header}

        <div className="mt-9 text-[22px] font-light">{t.compareTitle}</div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {all.map((e, i) => {
            const s = moneyShort(lang, e.total, rate);
            const pm = moneyShort(lang, e.perMinute, rate);
            const active = i === scenarioIdx;
            return (
              <div key={i} className={`rounded-[20px] p-5 ${active ? "bg-ink text-white" : "bg-[#f4f5f6]"}`}>
                <div className="flex items-center justify-between text-[13px]">
                  <span>{t.scenarios[i]}</span>
                  {active && <span className="rounded-full bg-orange px-2 py-0.5 text-[10px] text-white">{t.selected}</span>}
                </div>
                <div className={`mt-1 text-[11px] ${active ? "text-white/60" : "text-muted"}`}>
                  {num(lang, e.scenario.pace, 1)} {t.perDay}
                </div>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[30px] font-light leading-none">{s.value}</span>
                  <span className={`text-[11px] ${active ? "text-white/60" : "text-muted"}`}>{s.unit}</span>
                </div>
                <div className={`mt-4 grid gap-1 text-[11px] ${active ? "text-white/70" : "text-muted"}`}>
                  <span>
                    {days(lang, e.workDays)} {t.workDays} · {days(lang, e.calendarDays)} {t.daysUnit} {t.onCalendar}
                  </span>
                  <span>
                    {t.perMinute}: {pm.value} {pm.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-[1fr_1.25fr] gap-4">
          <div className="rounded-[22px] border border-line p-6">
            <div className="text-[17px] font-light">{t.phasesTitle}</div>
            <PhaseArcs animate={false} est={est} className={`mt-5 w-full ${lang === "fa" ? "-scale-x-100" : ""}`} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PHASES.map((k) => (
                <div key={k}>
                  <div className="text-[18px] font-light">
                    {days(lang, est.phases[k].days)} <span className="text-[11px] text-muted">{t.daysUnit}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">{t.phases[k]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[22px] border border-line p-6">
            <div className="flex items-center justify-between">
              <div className="text-[17px] font-light">{t.scheduleTitle}</div>
              <div className="text-[11px] text-muted">
                {days(lang, est.workDays)} {t.workDays}
              </div>
            </div>
            <div className="mt-5">
              <DayGrid animate={false} est={est} />
            </div>
            <div className="mt-4 flex gap-4 text-[11px] text-muted">
              {PHASES.map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: k === "pre" ? "#d5d9dd" : PHASE_COLORS[k] }} />
                  {t.phases[k]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[22px] bg-[#f4f5f6] p-6">
          <div className="text-[17px] font-light">{t.assumptions}</div>
          <ul className="mt-3 grid gap-2 text-[12.5px] leading-6 text-ink-2">
            {t.assumptionsList(num(lang, rate), num(lang, est.scenario.pace, 1)).map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-[9px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        {footer(2)}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-[#f1f2f4] px-3 py-1 text-ink-2">{children}</span>;
}

function Tile({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-[18px] border border-line px-4 py-3.5">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-[24px] font-light leading-none">{value}</span>
        {unit && <span className="text-[10px] text-muted">{unit}</span>}
      </div>
    </div>
  );
}
