import type { PropsWithChildren } from "react";

import { cn } from "./cn";

type Props = PropsWithChildren<{
  className?: string;
}>;

export function Tag({ className, children }: Props) {
  return <span className={cn("ds-chip", className)}>{children}</span>;
}
