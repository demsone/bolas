import { redirect } from "next/navigation";
import { setupOwner } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth/session";
import { hasAnyUser } from "@/lib/auth/users";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (await getCurrentUser()) redirect("/admin");
  if (await hasAnyUser()) redirect("/login");

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ember)]">First issue</p>
        <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.05em]">Make Bolas! yours.</h1>
        <p className="mt-5 max-w-md leading-7 text-[var(--muted)]">Create the owner account for publishing stories, pages, and media.</p>
        <AuthForm action={setupOwner} setup />
      </section>
    </main>
  );
}
