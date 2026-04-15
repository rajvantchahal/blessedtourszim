"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "../auth.module.css";
import { apiPostJson } from "../../lib/api";
import { saveAuth, type AuthResponse } from "../../lib/auth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateRegister(values: { email: string; password: string }) {
  const errors: { email?: string; password?: string } = {};
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!isValidEmail(values.email)) errors.email = "Enter a valid email address";

  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 6) errors.password = "Password must be at least 6 characters";

  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [affiliate, setAffiliate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const nextFieldErrors = validateRegister({ email, password });
    setFieldErrors(nextFieldErrors);
    if (nextFieldErrors.email || nextFieldErrors.password) return;

    setLoading(true);

    try {
      const data = await apiPostJson<AuthResponse>("/auth/register", {
        email,
        password,
        affiliate,
      });
      saveAuth(data);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authShell}>
        <header className={styles.topBar}>
          <div className={styles.brand}>
            <div className={styles.brandName}>BlessedToursZim</div>
            <div className={styles.brandTag}>Hotels • Sports • Activities</div>
          </div>

          <nav className={styles.topLinks}>
            <Link className={styles.topLink} href="/">
              Home
            </Link>
            <Link className={styles.topLink} href="/login">
              Login
            </Link>
          </nav>
        </header>

        <div className={styles.cardWrap}>
          <main className={styles.authCard}>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Start booking verified stays and activities in minutes.</p>

            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  className={`${styles.input}${fieldErrors.email ? ` ${styles.invalid}` : ""}`}
                  value={email}
                  onChange={(e) => {
                    const next = e.target.value;
                    setEmail(next);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  aria-invalid={fieldErrors.email ? "true" : "false"}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                />
                {fieldErrors.email ? (
                  <div id="email-error" className={styles.fieldError}>
                    {fieldErrors.email}
                  </div>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className={`${styles.input}${fieldErrors.password ? ` ${styles.invalid}` : ""}`}
                  value={password}
                  onChange={(e) => {
                    const next = e.target.value;
                    setPassword(next);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="At least 6 characters"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  aria-invalid={fieldErrors.password ? "true" : "false"}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                {fieldErrors.password ? (
                  <div id="password-error" className={styles.fieldError}>
                    {fieldErrors.password}
                  </div>
                ) : null}
              </div>

              <div className={styles.checkboxRow}>
                <input
                  id="affiliate"
                  type="checkbox"
                  checked={affiliate}
                  onChange={(e) => setAffiliate(e.target.checked)}
                />
                <label htmlFor="affiliate">Register as affiliate partner</label>
              </div>

              {error ? <div className={styles.error}>{error}</div> : null}

              <div className={styles.actions}>
                <button className={styles.buttonPrimary} type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create account"}
                </button>
                <Link className={styles.buttonSecondary} href="/login">
                  I already have an account
                </Link>
              </div>
            </form>

            <footer className={styles.footer}>
              <Link href="/">Back to home</Link>
              <a href="http://127.0.0.1:5000/health" target="_blank" rel="noopener noreferrer">
                API status
              </a>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
