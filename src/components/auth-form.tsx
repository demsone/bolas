"use client";

import { useActionState } from "react";
import type { AuthActionState } from "@/app/actions/auth";

type AuthAction = (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;

export function AuthForm({ action, setup = false }: { action: AuthAction; setup?: boolean }) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {setup && (
        <label className="grid gap-2 text-sm font-medium">
          Your name
          <input className="hearth-input" name="displayName" autoComplete="name" required />
        </label>
      )}
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input className="hearth-input" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <input className="hearth-input" name="password" type="password" autoComplete={setup ? "new-password" : "current-password"} minLength={12} required />
      </label>
      {setup && <p className="text-sm leading-6 text-[var(--muted)]">Use 12 or more characters. This account will own Bolas.</p>}
      {state.error && <p className="border-l-2 border-[var(--ember)] bg-[#f8e6df] px-3 py-2 text-sm text-[var(--ink)]">{state.error}</p>}
      <button className="hearth-button" disabled={pending} type="submit">
        {pending ? "Working…" : setup ? "Create owner account" : "Sign in"}
      </button>
    </form>
  );
}
