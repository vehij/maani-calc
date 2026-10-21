"use client";

import { useState } from "react";
import { DICTS, type Lang } from "@/lib/i18n.ts";

export function LoginForm({ lang, next }: { lang: Lang; next?: string }) {
  const t = DICTS[lang];
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const target = next && next.startsWith(`/${lang}`) && !next.startsWith("//") ? next : `/${lang}`;
        window.location.assign(target);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data?.error === "not-configured" ? t.notConfigured : t.wrongPassword);
    } catch {
      setError(t.networkError);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-sm">
      <label htmlFor="password" className="mb-2 block text-[13px] text-muted">
        {t.password}
      </label>
      <div
        className={`flex items-center rounded-2xl border bg-canvas/60 transition focus-within:border-teal focus-within:bg-white ${
          error ? "border-orange" : "border-transparent"
        }`}
      >
        <input
          id="password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          autoFocus
          dir="ltr"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className="h-14 w-full bg-transparent px-4 text-[17px] tracking-wide outline-none"
          aria-invalid={!!error}
          aria-describedby={error ? "login-error" : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="me-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:text-ink"
          aria-label={show ? "Hide password" : "Show password"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {show && <path d="M3 3l18 18" />}
          </svg>
        </button>
      </div>
      <p id="login-error" role="alert" className="mt-2 min-h-5 text-[13px] text-orange">
        {error}
      </p>
      <button
        type="submit"
        disabled={busy || !password}
        className="group mt-3 flex h-14 w-full items-center justify-between rounded-full bg-ink ps-6 pe-2 text-[16px] text-white transition disabled:opacity-50"
      >
        <span>{busy ? t.checking : t.enter}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange transition group-hover:scale-105">
          <ArrowIcon />
        </span>
      </button>
    </form>
  );
}

export function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="rtl:-scale-x-100">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
