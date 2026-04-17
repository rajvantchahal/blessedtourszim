import type { PropsWithChildren } from "react";

import { cn } from "./cn";

type Tone = "default" | "success" | "warning" | "danger";

type Props = PropsWithChildren<{
  className?: string;
  tone?: Tone;
}>;

export function Badge({ className, tone = "default", children }: Props) {
  return (
    <span
      className={cn(
        "ds-badge",
        tone === "success" && "ds-badgeSuccess",
        tone === "warning" && "ds-badgeWarning",
        tone === "danger" && "ds-badgeDanger",
        className
      )}
    >
      {children}
    </span>
  );
}
