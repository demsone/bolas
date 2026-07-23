"use client";

import { useState } from "react";

export function LoginForm({ error }: { error?: string }) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form action="/api/auth/login" className="mt-8 space-y-5" method="post" onSubmit={() => setSubmitting(true)}>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input className="hearth-input" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <input className="hearth-input" name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <p className="border-l-2 border-[var(--ember)] bg-[#f8e6df] px-3 py-2 text-sm text-[var(--ink)]">{error}</p>}
      <button className="hearth-button" disabled={submitting} type="submit">
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
