"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";

import { cn } from "./cn";

type Props = PropsWithChildren<{
  open: boolean;
  title?: string;
  onClose: () => void;
  className?: string;
  actions?: React.ReactNode;
}>;

export function Modal({ open, title, onClose, className, actions, children }: Props) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="ds-modalOverlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn("ds-modal", className)}>
        {title ? <div className="ds-modalTitle">{title}</div> : null}
        <div style={{ marginTop: title ? 10 : 0 }}>{children}</div>
        {actions ? <div className="ds-modalActions">{actions}</div> : null}
      </div>
    </div>
  );
}
