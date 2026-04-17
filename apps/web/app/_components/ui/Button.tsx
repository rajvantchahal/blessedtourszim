"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  fullWidth,
  leftIcon,
  rightIcon,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(
        "ds-button",
        variant === "primary" && "ds-buttonPrimary",
        variant === "secondary" && "ds-buttonSecondary",
        variant === "ghost" && "ds-buttonGhost",
        className
      )}
      style={fullWidth ? { width: "100%" } : undefined}
      {...rest}
    >
      {leftIcon ? <span aria-hidden>{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span aria-hidden>{rightIcon}</span> : null}
    </button>
  );
}
