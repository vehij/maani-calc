// Cost engine for AI film / animation / series production.
// A direct port of the "موتور براورد" sheets in the studio's estimate workbook.
// Every amount is in Toman unless the name says otherwise; cell references in
// the comments point to the original spreadsheet.

export type PhaseKey = "pre" | "prod" | "post";

export interface Scenario {
  /** Finished minutes produced per production day (A55..A57). */
  pace: number;
  /** Pre-production days (H55..H57). */
  preDays: number;
  /** Post-production days (I55..I57). */
  postDays: number;
}

export interface EngineParams {
  /** Daily infrastructure, depreciation and overhead per phase (B4/C4/D4). */
  overhead: Record<PhaseKey, number>;
  /** Daily share of profit and bonuses per phase (B5/C5/D5). */
  profitShare: Record<PhaseKey, number>;
  /** Whether post-production carries overhead and profit share (D55 differs between sheets). */
  postIncludesOverhead: boolean;
  /** Daily food and catering cost per person (the 600,000 / 500,000 constants). */
  mealPerPerson: number;
  /** Contingency is (account costs) / contingencyDivisor (the 7.5 constant). */
  contingencyDivisor: number;
  /** Calendar overlap between phases; total days = sum × factor (F55). */
  overlapFactor: number;

  /** AI platform pricing (production column). */
  creditPriceCents: number; // B39
  creditsPerFrame: number; // B40
  creditsPerClip: number; // B44
  clipSeconds: number; // the /15 in B45

  pre: {
    otherCrewDailyWage: number; // C20
    otherCrewCount: number; // C21
    generators: number; // C22
    generatorMonthlyWage: number; // C23
    wageDays: number; // C24
    framesPerGenerator: number; // C26
    otherAccountsUsdPerDay: number; // the 15 in C28
  };
  prod: {
    generatorMonthlyWage: number; // B31
    wageDays: number; // B32
    otherCrewCount: number; // B34
    videoGenerators: number; // B35
    frameGenerators: number; // B36
    framesPerGenerator: number; // B37
    videoSecondsPerGenerator: number; // B43
    otherAccountsUsdPerDay: number; // the 15 in B49
    otherCrewDailyWage: number; // B50
  };
  post: {
    generatorMonthlyWage: number; // D6
    generators: number; // D7
    wageDays: number; // D8
    directionDailyWage: number; // D10
    technicalDailyWage: number; // D11
    directionCount: number; // D12
    framesPerGenerator: number; // D13
    otherAccountsUsdPerDay: number; // the 10/15 in D15
    videoSecondsPerGenerator: number; // D16
  };

  scenarios: [Scenario, Scenario, Scenario];
}

export interface EstimateInput {
  /** Runtime of the finished work in minutes (E55). */
  minutes: number;
  /** Toman per US dollar (B38). */
  usdRate: number;
  scenario: Scenario;
}

export interface DailyBreakdown {
  /** Costs billed in dollars: AI credits, other subscriptions, contingency on them. */
  platform: number;
  /** Costs paid in Toman: wages, food and logistics. */
  crew: number;
  /** Overhead and profit share. */
  overhead: number;
  total: number;
  headcount: number;
}

export interface PhaseResult extends DailyBreakdown {
  days: number;
  daily: DailyBreakdown;
}

export interface Estimate {
  minutes: number;
  usdRate: number;
  scenario: Scenario;
  phases: Record<PhaseKey, PhaseResult>;
  /** Sum of working days across the three phases. */
  workDays: number;
  /** Calendar days after phase overlap (F55). */
  calendarDays: number;
  total: number; // M55
  totalUsd: number; // N55
  platform: number; // P55
  crew: number; // Q55
  overhead: number;
  perMinute: number; // R55
  perMinuteUsd: number;
  peakHeadcount: number;
}

export function dailyCosts(p: EngineParams, usdRate: number): Record<PhaseKey, DailyBreakdown> {
  const creditToman = (usdRate / 100) * p.creditPriceCents;
  const frameCost = creditToman * p.creditsPerFrame; // B41
  const videoSecondCost = (creditToman * p.creditsPerClip) / p.clipSeconds; // B45

  // Production (column B)
  const pr = p.prod;
  const prodGeneratorWages = (pr.generatorMonthlyWage / pr.wageDays) * (pr.videoGenerators + pr.frameGenerators); // B33
  const prodFrames = pr.frameGenerators * pr.framesPerGenerator * frameCost; // B42
  const prodVideo = pr.videoSecondsPerGenerator * videoSecondCost * pr.videoGenerators; // B46
  const prodOtherAccounts = usdRate * pr.otherAccountsUsdPerDay; // B49
  const prodHeadcount = pr.otherCrewCount + pr.videoGenerators + pr.frameGenerators;
  const prodMeals = prodHeadcount * p.mealPerPerson; // B51
  const prodContingency = (prodFrames + prodVideo) / p.contingencyDivisor; // B52
  const prod = breakdown(
    prodFrames + prodVideo + prodOtherAccounts + prodContingency,
    prodGeneratorWages + pr.otherCrewDailyWage + prodMeals,
    p.overhead.prod + p.profitShare.prod,
    prodHeadcount,
  );

  // Pre-production (column C)
  const pe = p.pre;
  const preGeneratorWages = (pe.generatorMonthlyWage / pe.wageDays) * pe.generators; // C25
  const preFrames = pe.generators * pe.framesPerGenerator * frameCost; // C27
  const preOtherAccounts = usdRate * pe.otherAccountsUsdPerDay; // C28
  const preHeadcount = pe.otherCrewCount + pe.generators;
  const preMeals = preHeadcount * p.mealPerPerson; // C29
  const preContingency = (preFrames + preOtherAccounts) / p.contingencyDivisor; // C30
  const pre = breakdown(
    preFrames + preOtherAccounts + preContingency,
    pe.otherCrewDailyWage + preGeneratorWages + preMeals,
    p.overhead.pre + p.profitShare.pre,
    preHeadcount,
  );

  // Post-production (column D)
  const po = p.post;
  const postGeneratorWages = (po.generatorMonthlyWage / po.wageDays) * po.generators; // D9
  const postFrames = po.framesPerGenerator * po.generators * frameCost; // D14
  const postOtherAccounts = usdRate * po.otherAccountsUsdPerDay; // D15
  const postVideo = po.videoSecondsPerGenerator * videoSecondCost * po.generators; // D17
  const postHeadcount = po.generators + po.directionCount;
  const postMeals = postHeadcount * p.mealPerPerson; // D18
  const postContingency = (postFrames + postOtherAccounts + postVideo) / p.contingencyDivisor; // D19
  const post = breakdown(
    postFrames + postOtherAccounts + postVideo + postContingency,
    postGeneratorWages + po.directionDailyWage + po.technicalDailyWage + postMeals,
    p.postIncludesOverhead ? p.overhead.post + p.profitShare.post : 0,
    postHeadcount,
  );

  return { pre, prod, post };
}

export function estimate(p: EngineParams, input: EstimateInput): Estimate {
  const { minutes, usdRate, scenario } = input;
  const daily = dailyCosts(p, usdRate);
  const days: Record<PhaseKey, number> = {
    pre: scenario.preDays,
    prod: scenario.pace > 0 ? minutes / scenario.pace : 0, // G55
    post: scenario.postDays,
  };

  const phases = {} as Record<PhaseKey, PhaseResult>;
  for (const k of ["pre", "prod", "post"] as PhaseKey[]) {
    const d = daily[k];
    const n = days[k];
    phases[k] = {
      days: n,
      daily: d,
      platform: d.platform * n,
      crew: d.crew * n,
      overhead: d.overhead * n,
      total: d.total * n,
      headcount: d.headcount,
    };
  }

  const sum = (f: (r: PhaseResult) => number) => f(phases.pre) + f(phases.prod) + f(phases.post);
  const total = sum((r) => r.total);
  const workDays = days.pre + days.prod + days.post;

  return {
    minutes,
    usdRate,
    scenario,
    phases,
    workDays,
    calendarDays: workDays * p.overlapFactor,
    total,
    totalUsd: usdRate > 0 ? total / usdRate : 0,
    platform: sum((r) => r.platform),
    crew: sum((r) => r.crew),
    overhead: sum((r) => r.overhead),
    perMinute: minutes > 0 ? total / minutes : 0,
    perMinuteUsd: minutes > 0 && usdRate > 0 ? total / minutes / usdRate : 0,
    peakHeadcount: Math.max(daily.pre.headcount, daily.prod.headcount, daily.post.headcount),
  };
}

function breakdown(platform: number, crew: number, overhead: number, headcount: number): DailyBreakdown {
  return { platform, crew, overhead, total: platform + crew + overhead, headcount };
}
