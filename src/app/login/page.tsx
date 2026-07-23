import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { hasAnyUser } from "@/lib/auth/users";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  credentials: "Email or password is not recognised.",
  locked: "Too many attempts. Please wait a few minutes and try again.",
  unavailable: "Sign in was interrupted. Please try once more.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/admin");
  if (!(await hasAnyUser())) redirect("/setup");
  const { error } = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ember)]">Welcome back</p>
        <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.05em]">Return to the workbench.</h1>
        <p className="mt-5 max-w-md leading-7 text-[var(--muted)]">Sign in to publish stories, manage media, and tune the magazine settings.</p>
        <LoginForm error={error ? errorMessages[error] : undefined} />
      </section>
    </main>
  );
}
