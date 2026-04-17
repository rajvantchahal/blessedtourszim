import type { PropsWithChildren } from "react";

import { cn } from "./cn";

type Props = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: Props) {
  return <div className={cn("ds-card", className)}>{children}</div>;
}
