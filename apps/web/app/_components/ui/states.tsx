import type { ReactNode } from "react";

import { cn } from "./cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ds-card", className)} style={{ padding: 18, textAlign: "center" }}>
      <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>{title}</div>
      {description ? <div className="ds-muted" style={{ marginTop: 6 }}>{description}</div> : null}
      {action ? <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("ds-card", className)}
      style={{ padding: 18, borderColor: "rgba(220, 38, 38, 0.22)", background: "rgba(255, 255, 255, 0.94)" }}
    >
      <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>{title}</div>
      {description ? <div className="ds-muted" style={{ marginTop: 6 }}>{description}</div> : null}
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  );
}

export function LoadingBlock({ className }: { className?: string }) {
  return <div className={cn("ds-skeleton", className)} style={{ width: "100%", height: 48 }} aria-hidden />;
}
