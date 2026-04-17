"use client";

import Link from "next/link";
import { useState } from "react";

import styles from "../auth.module.css";
import { apiPostJson } from "../../lib/api";
import { useToast } from "../_components/ui/toast";

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"
      />
    </svg>
  );
}

type ForgotResponse = {
  ok: boolean;
  message?: string;
  devToken?: string;
};

export default function ForgotPasswordPage() {
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setDevToken(null);

    try {
      const data = await apiPostJson<ForgotResponse>("/auth/forgot-password", { email });
      if (data.devToken) setDevToken(data.devToken);
      push({
        title: "Check your email",
        message: data.message ?? "If that email exists, a reset link will be sent.",
      });
    } catch (err) {
      push({
        title: "Could not send reset link",
        message: err instanceof Error ? err.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authShell}>
        <Link className={styles.authLogoLink} href="/" aria-label="Go to homepage">
          <span className={styles.authLogoMark} aria-hidden>
            ✦
          </span>
          <span className={styles.authLogoText}>BlessedToursZim</span>
        </Link>

        <main className={styles.authCard}>
          <h1 className={styles.title}>Forgot password</h1>
          <p className={styles.subtitle}>We&apos;ll send a reset link to your email address.</p>

          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email address
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIconLeft} aria-hidden>
                  <MailIcon />
                </span>
                <input
                  id="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.buttonPrimary} type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </div>
          </form>

          {devToken ? (
            <div style={{ marginTop: 14 }}>
              <div className={styles.subtitle} style={{ marginTop: 0 }}>
                Dev-only token (for local testing):
              </div>
              <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <code style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12 }}>{devToken}</code>
                <Link className={styles.helperLink} href={`/reset-password?token=${encodeURIComponent(devToken)}`}>
                  Open reset page
                </Link>
              </div>
            </div>
          ) : null}

          <div className={styles.bottomLink}>
            Remembered your password?{" "}
            <Link className={styles.helperLink} href="/login">
              Back to login
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
