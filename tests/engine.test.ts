import { test } from "node:test";
import assert from "node:assert/strict";
import { estimate } from "../lib/engine.ts";
import { PRESETS, type ProjectType } from "../lib/presets.ts";

// Values computed by Excel in the source workbook (columns M, N, P, Q, R of rows 55-57).
const expected: Record<ProjectType, { scenario: number; M: number; N: number; P: number; Q: number; R: number }[]> = {
  series: [
    { scenario: 0, M: 10185008000, N: 39173.11, P: 7765541333.33, Q: 2287466666.67, R: 84875066.67 },
    // Row 56 of the series sheet hard-codes 55 production days instead of minutes/pace, so it is not compared.
    { scenario: 2, M: 14724536000, N: 56632.83, P: 11843069333.33, Q: 2719466666.67, R: 122704466.67 },
  ],
  animation: [
    { scenario: 0, M: 6172144222.22, N: 31815.18, P: 2915755333.33, Q: 2643055555.56, R: 61721442.22 },
    { scenario: 1, M: 7001351466.67, N: 36089.44, P: 3788018133.33, Q: 2573333333.33, R: 70013514.67 },
    { scenario: 2, M: 10649646560, N: 54895.09, P: 6705979893.33, Q: 3079666666.67, R: 106496465.6 },
  ],
  film: [
    { scenario: 0, M: 6179291555.56, N: 37678.61, P: 2510402666.67, Q: 2655555555.56, R: 61792915.56 },
    { scenario: 1, M: 6782005333.33, N: 41353.69, P: 3238672000, Q: 2583333333.33, R: 67820053.33 },
    { scenario: 2, M: 9869140266.67, N: 60177.68, P: 5694473600, Q: 3086666666.67, R: 98691402.67 },
  ],
};

const close = (actual: number, want: number) =>
  assert.ok(Math.abs(actual - want) <= Math.max(0.02, Math.abs(want) * 1e-9), `${actual} != ${want}`);

for (const type of Object.keys(expected) as ProjectType[]) {
  for (const row of expected[type]) {
    test(`${type} scenario ${row.scenario + 1} matches the workbook`, () => {
      const preset = PRESETS[type];
      const r = estimate(preset.params, {
        minutes: preset.defaultMinutes,
        usdRate: preset.sheetUsdRate,
        scenario: preset.params.scenarios[row.scenario],
      });
      close(r.total, row.M);
      close(r.totalUsd, row.N);
      close(r.platform, row.P);
      close(r.crew, row.Q);
      close(r.perMinute, row.R);
      close(r.platform + r.crew + r.overhead, r.total);
    });
  }
}
