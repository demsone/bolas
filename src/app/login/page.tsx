import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth/session";
import { hasAnyUser } from "@/lib/auth/users";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  if (!hasAnyUser()) redirect("/setup");

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ember)]">Welcome back</p>
        <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.05em]">Return to the workbench.</h1>
        <p className="mt-5 max-w-md leading-7 text-[var(--muted)]">Sign in to publish stories, manage media, and tune the magazine settings.</p>
        <AuthForm action={login} />
      </section>
    </main>
  );
}
