"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
};

export function Input({
  className,
  id,
  label,
  error,
  leftIcon,
  rightElement,
  ...rest
}: Props) {
  const inputId = id ?? rest.name ?? undefined;
  const describedBy = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className={cn("ds-field", className)}>
      {label && inputId ? (
        <label className="ds-label" htmlFor={inputId}>
          {label}
        </label>
      ) : label ? (
        <div className="ds-label">{label}</div>
      ) : null}

      <div className="ds-inputWrap">
        {leftIcon ? (
          <span className="ds-inputIconLeft" aria-hidden>
            {leftIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={cn("ds-input", error && "ds-inputInvalid")}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          {...rest}
        />
        {rightElement ? <span>{rightElement}</span> : null}
      </div>

      {error && inputId ? (
        <div id={`${inputId}-error`} className="ds-fieldError">
          {error}
        </div>
      ) : error ? (
        <div className="ds-fieldError">{error}</div>
      ) : null}
    </div>
  );
}
