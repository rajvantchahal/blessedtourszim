"use client";

import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastTone = "default" | "success" | "warning" | "danger";

type Toast = {
  id: string;
  title: string;
  message?: string;
  tone?: ToastTone;
};

type ToastInput = Omit<Toast, "id">;

type ToastContextValue = {
  push: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timers.current[id];
    if (handle) window.clearTimeout(handle);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = makeId();
      const entry: Toast = { id, ...toast };
      setToasts((prev) => [entry, ...prev].slice(0, 4));
      timers.current[id] = window.setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length ? (
        <div className="ds-toastViewport" aria-live="polite" aria-relevant="additions">
          {toasts.map((t) => (
            <div key={t.id} className="ds-toast" role="status">
              <div className="ds-toastTitle">{t.title}</div>
              {t.message ? <div className="ds-toastBody">{t.message}</div> : null}
              <div className="ds-toastRow">
                <button
                  className="ds-link"
                  type="button"
                  onClick={() => remove(t.id)}
                  aria-label="Dismiss"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
