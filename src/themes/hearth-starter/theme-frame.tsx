import type { CSSProperties, ReactNode } from "react";
import type { ThemeManifest } from "@/lib/themes/contract";

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export function ThemeFrame({ children, manifest, className = "" }: { children: ReactNode; manifest: ThemeManifest; className?: string }) {
  const { colors, typography, layout } = manifest.tokens;
  const style: ThemeStyle = {
    "--ash": colors.canvas,
    "--paper": colors.surface,
    "--ink": colors.text,
    "--muted": colors.muted,
    "--line": colors.line,
    "--ember": colors.accent,
    "--theme-display": typography.display,
    "--theme-body": typography.body,
    "--theme-utility": typography.utility,
    "--theme-reading-width": layout.readingWidth,
    "--theme-shell-width": layout.shellWidth,
  };
  return <main className={`starter-theme min-h-screen bg-[var(--paper)] text-[var(--ink)] ${className}`} data-theme={manifest.id} style={style}>{children}</main>;
}
