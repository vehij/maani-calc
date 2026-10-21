# Maani Studio — AI Production Cost Estimator

ماشین‌حساب برآورد هزینه تولید فیلم، انیمیشن و سریال با هوش مصنوعی برای استودیو مانی.
Password-protected calculator with Persian (Toman) and English (USD) versions and PDF export.

## Routes

| Path | |
| --- | --- |
| `/fa` | نسخه فارسی (قیمت به تومان) |
| `/en` | English version (prices in USD) |
| `/fa/login`, `/en/login` | Access password |

## Access password

Set `ACCESS_PASSWORD` in Vercel → Project → Settings → Environment Variables, then redeploy.
Changing it signs everyone out. Locally, put it in `.env.local` (see `.env.example`).

## Changing the numbers

All studio rates (wages, crew sizes, credit prices, scenario paces and days) live in
[`lib/presets.ts`](lib/presets.ts), one block per project type. They come from the three
engine sheets of the estimate workbook; the formulas are ported in [`lib/engine.ts`](lib/engine.ts)
with the original cell references in comments. `npm test` checks the engine against the
values Excel computed.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # engine vs. workbook
npm run build
```

Next.js 16 (App Router) · Tailwind CSS 4 · html-to-image + jsPDF for the PDF · Estedad / Lexend fonts.
