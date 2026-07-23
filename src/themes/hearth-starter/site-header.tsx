import Link from "next/link";
import { getDb } from "@/lib/db/client";
import { getSiteSettings } from "@/lib/settings/repository";

export async function SiteHeader() {
  const settings = await getSiteSettings(getDb());
  return (
    <header className="public-header">
      <Link className="font-semibold" href="/">{settings.siteName}</Link>
      <nav className="flex gap-5">
        <Link href="/journal">Journal</Link>
        <Link href="/admin">Admin</Link>
      </nav>
    </header>
  );
}
