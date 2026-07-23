import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const canManageSite = can(user.role, "manage_site");

  return (
    <div className="min-h-screen bg-[var(--ash)] p-3 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl border border-[var(--line)] bg-[var(--paper)] sm:min-h-[calc(100vh-3rem)] md:grid-cols-[13rem_1fr]">
        <aside className="flex flex-col border-b border-[var(--line)] p-5 md:border-r md:border-b-0">
          <Link className="flex items-center gap-3 font-semibold" href="/admin"><span className="grid size-8 place-items-center rounded-full bg-[var(--ember)] font-mono text-xs text-white">B</span>Bolas!</Link>
          <nav className="mt-8 flex gap-2 md:flex-col">
            <Link className="admin-nav-link" href="/admin">Overview</Link>
            <Link className="admin-nav-link" href="/admin/content">Content</Link>
            <Link className="admin-nav-link" href="/admin/taxonomy">Categories & tags</Link>
            <Link className="admin-nav-link" href="/admin/media">Media</Link>
            {canManageSite && <Link className="admin-nav-link" href="/admin/settings">Site settings</Link>}
          </nav>
          <div className="mt-8 border-t border-[var(--line)] pt-5 text-sm md:mt-auto">
            <p className="font-medium">{user.displayName}</p>
            <p className="mt-1 text-[var(--muted)]">{user.role}</p>
            <form action={logout} className="mt-4"><button className="text-sm underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--ember)]" type="submit">Sign out</button></form>
          </div>
        </aside>
        <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
