import type { EngineParams } from "./engine.ts";

// Studio parameters taken from the three engine sheets of the estimate workbook.
// Change numbers here to retune the calculator; the UI picks them up on the next deploy.

export type ProjectType = "series" | "animation" | "film";

export const PROJECT_TYPES: ProjectType[] = ["film", "animation", "series"];

/** Default Toman-per-dollar rate shown when the calculator opens. */
export const DEFAULT_USD_RATE = 260_000;

export interface Preset {
  params: EngineParams;
  defaultMinutes: number;
  /** Rate the source sheet was calculated with (used by the tests). */
  sheetUsdRate: number;
}

// Sheet «موتور براورد سریال»
const series: Preset = {
  defaultMinutes: 120,
  sheetUsdRate: 260_000,
  params: {
    overhead: { pre: 3_000_000, prod: 3_000_000, post: 3_000_000 },
    profitShare: { pre: 0, prod: 0, post: 0 },
    postIncludesOverhead: false,
    mealPerPerson: 600_000,
    contingencyDivisor: 7.5,
    overlapFactor: 1,
    creditPriceCents: 5,
    creditsPerFrame: 4,
    creditsPerClip: 180,
    clipSeconds: 15,
    pre: {
      otherCrewDailyWage: 15_000_000,
      otherCrewCount: 3,
      generators: 2,
      generatorMonthlyWage: 70_000_000,
      wageDays: 30,
      framesPerGenerator: 40,
      otherAccountsUsdPerDay: 15,
    },
    prod: {
      generatorMonthlyWage: 70_000_000,
      wageDays: 30,
      otherCrewCount: 3,
      videoGenerators: 5,
      frameGenerators: 4,
      framesPerGenerator: 30,
      videoSecondsPerGenerator: 300,
      otherAccountsUsdPerDay: 15,
      otherCrewDailyWage: 20_000_000,
    },
    post: {
      generatorMonthlyWage: 70_000_000,
      generators: 2,
      wageDays: 30,
      directionDailyWage: 10_000_000,
      technicalDailyWage: 15_000_000,
      directionCount: 5,
      framesPerGenerator: 20,
      otherAccountsUsdPerDay: 10,
      videoSecondsPerGenerator: 120,
    },
    scenarios: [
      { pace: 5, preDays: 20, postDays: 20 },
      { pace: 4, preDays: 20, postDays: 15 },
      { pace: 3, preDays: 14, postDays: 14 },
    ],
  },
};

// Sheet «موتور براورد فیلم» (titled "animation" inside the sheet)
const animation: Preset = {
  defaultMinutes: 100,
  sheetUsdRate: 194_000,
  params: {
    overhead: { pre: 8_000_000, prod: 8_000_000, post: 8_000_000 },
    profitShare: { pre: 8_000_000, prod: 8_000_000, post: 8_000_000 },
    postIncludesOverhead: false,
    mealPerPerson: 500_000,
    contingencyDivisor: 7.5,
    overlapFactor: 0.8,
    creditPriceCents: 6,
    creditsPerFrame: 4,
    creditsPerClip: 135,
    clipSeconds: 15,
    pre: {
      otherCrewDailyWage: 30_000_000,
      otherCrewCount: 5,
      generators: 4,
      generatorMonthlyWage: 50_000_000,
      wageDays: 30,
      framesPerGenerator: 50,
      otherAccountsUsdPerDay: 15,
    },
    prod: {
      generatorMonthlyWage: 50_000_000,
      wageDays: 30,
      otherCrewCount: 5,
      videoGenerators: 5,
      frameGenerators: 5,
      framesPerGenerator: 40,
      videoSecondsPerGenerator: 240,
      otherAccountsUsdPerDay: 15,
      otherCrewDailyWage: 25_000_000,
    },
    post: {
      generatorMonthlyWage: 50_000_000,
      generators: 2,
      wageDays: 30,
      directionDailyWage: 15_000_000,
      technicalDailyWage: 15_000_000,
      directionCount: 8,
      framesPerGenerator: 30,
      otherAccountsUsdPerDay: 10,
      videoSecondsPerGenerator: 60,
    },
    scenarios: [
      { pace: 7.5, preDays: 25, postDays: 25 },
      { pace: 5, preDays: 20, postDays: 20 },
      { pace: 2.5, preDays: 14, postDays: 14 },
    ],
  },
};

// Sheet «فیلم»
const film: Preset = {
  defaultMinutes: 100,
  sheetUsdRate: 164_000,
  params: {
    ...animation.params,
    postIncludesOverhead: true,
    pre: { ...animation.params.pre, otherCrewCount: 6 },
    post: { ...animation.params.post, framesPerGenerator: 40, otherAccountsUsdPerDay: 15 },
  },
};

export const PRESETS: Record<ProjectType, Preset> = { series, animation, film };
