import { getActiveTheme } from "@/lib/themes/runtime";

export const dynamic = "force-dynamic";

export default function Home() {
  const theme = getActiveTheme();
  const HomeTemplate = theme.templates.Home;
  return <HomeTemplate manifest={theme.manifest} />;
}
