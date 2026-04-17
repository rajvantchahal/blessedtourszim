"use client";

import type { PropsWithChildren } from "react";

import { ToastProvider } from "./_components/ui/toast";

export default function Providers({ children }: PropsWithChildren) {
  return <ToastProvider>{children}</ToastProvider>;
}
