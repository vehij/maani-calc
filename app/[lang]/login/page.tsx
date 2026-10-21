import Link from "next/link";
import { DICTS, isLang } from "@/lib/i18n.ts";
import { Brand } from "@/components/Brand.tsx";
import { LoginForm } from "@/components/LoginForm.tsx";
import { FilmStack } from "@/components/Illustrations.tsx";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : "fa";
  const { next } = await searchParams;
  const t = DICTS[lang];
  const other = lang === "fa" ? "en" : "fa";

  return (
    <main className="mx-auto flex min-h-dvh max-w-[1100px] flex-col px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <Brand t={t} />
        <Link
          href={`/${other}/login`}
          className="rounded-full bg-card px-4 py-2 text-sm text-ink-2 transition hover:bg-white/70"
          lang={other}
        >
          {t.switchLang}
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center py-10">
        <div className="card rise relative grid w-full max-w-[920px] overflow-hidden md:grid-cols-[1.1fr_1fr]">
          <div className="relative z-10 p-7 sm:p-10">
            <h1 className="text-[30px] font-light leading-tight tracking-tight sm:text-[40px]">{t.loginTitle}</h1>
            <p className="mt-3 max-w-sm text-[15px] leading-7 text-muted">{t.loginLead}</p>
            <LoginForm lang={lang} next={next} />
          </div>
          <div className="relative hidden min-h-[380px] md:block">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(70% 70% at 60% 45%, rgba(242,105,44,0.28), rgba(242,105,44,0.08) 55%, transparent 80%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <FilmStack className="w-[78%]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
