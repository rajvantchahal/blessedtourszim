"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "../auth.module.css";
import { apiPostJson } from "../../lib/api";
import { isTwoFactorRequired, saveAuth, type LoginResponse } from "../../lib/auth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateLogin(values: { email: string; password: string }) {
  const errors: { email?: string; password?: string } = {};
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!isValidEmail(values.email)) errors.email = "Enter a valid email address";

  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 6) errors.password = "Password must be at least 6 characters";

  return errors;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.199 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691 12.88 19.51C14.66 15.108 18.977 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.35 4.327-17.694 10.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.098 0 9.794-1.96 13.333-5.146l-6.157-5.208C29.201 35.155 26.715 36 24 36c-5.178 0-9.614-3.318-11.268-7.946l-6.53 5.032C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.08 12.08 0 0 1-4.127 5.646h.003l6.157 5.208C36.9 39.267 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M16.7 13.2c0-2 1.7-3 1.8-3.1-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.6 1.1 8.8.8 1.1 1.6 2.3 2.7 2.3 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1.1 2.6-2.2.9-1.3 1.2-2.6 1.2-2.7-.1 0-2.3-.9-2.3-3.9ZM14.5 6.7c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.7-1 1.7-.9 2.7 1 0 1.9-.5 2.5-1.3Z"
      />
    </svg>
  );
}

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

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V6Z"
      />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
      {hidden ? (
        <path
          fill="currentColor"
          d="M12 6c3.9 0 7.3 2.2 9.5 6-2.2 3.8-5.6 6-9.5 6S4.7 15.8 2.5 12C4.7 8.2 8.1 6 12 6Zm0 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M2.1 4.2 3.5 2.8l18.4 18.4-1.4 1.4-2.1-2.1A11.9 11.9 0 0 1 12 18c-3.9 0-7.3-2.2-9.5-6a12.5 12.5 0 0 1 4.1-4.6L2.1 4.2ZM12 6c1.5 0 2.9.3 4.2.8L13.9 4.5c-.6-.1-1.2-.2-1.9-.2-3.9 0-7.3 2.2-9.5 6 .7 1.2 1.6 2.3 2.6 3.2l1.6-1.6A5.9 5.9 0 0 1 12 6Zm0 4a2 2 0 0 0-2 2c0 .3.1.6.2.9l2.7 2.7c.3.1.6.2.9.2a2 2 0 0 0 2-2c0-.3-.1-.6-.2-.9l-2.7-2.7c-.3-.1-.6-.2-.9-.2Z"
        />
      )}
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (twoFactorRequired && challengeToken) {
      if (!twoFactorCode.trim()) {
        setError("Enter your 2FA code");
        return;
      }

      setLoading(true);
      try {
        const data = await apiPostJson<LoginResponse>("/auth/login/2fa", {
          challengeToken,
          code: twoFactorCode.trim(),
        });
        if (isTwoFactorRequired(data)) {
          setError("2FA is still required");
          return;
        }
        saveAuth(data);
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "2FA verification failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    const nextFieldErrors = validateLogin({ email, password });
    setFieldErrors(nextFieldErrors);
    if (nextFieldErrors.email || nextFieldErrors.password) return;

    setLoading(true);

    try {
      const data = await apiPostJson<LoginResponse>("/auth/login", {
        email,
        password,
      });
      if (isTwoFactorRequired(data)) {
        setTwoFactorRequired(true);
        setChallengeToken(data.challengeToken);
        setTwoFactorCode("");
        return;
      }
      saveAuth(data);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
          <h1 className={styles.title}>{twoFactorRequired ? "Two-factor verification" : "Welcome back 👋"}</h1>
          <p className={styles.subtitle}>
            {twoFactorRequired
              ? "Enter the 6-digit code from your authenticator app"
              : "Login to continue planning your trips"}
          </p>

          <div className={styles.socialButtons}>
            <button className={styles.socialButton} type="button">
              <span className={styles.socialIcon} aria-hidden>
                <GoogleIcon />
              </span>
              Continue with Google
            </button>
            <button className={styles.socialButton} type="button">
              <span className={styles.socialIcon} aria-hidden>
                <AppleIcon />
              </span>
              Continue with Apple
            </button>
          </div>

          <div className={styles.divider} aria-hidden>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or</span>
            <span className={styles.dividerLine} />
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
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
                  disabled={twoFactorRequired}
                />
              </div>
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
              <div className={styles.inputWrap}>
                <span className={styles.inputIconLeft} aria-hidden>
                  <LockIcon />
                </span>
                <input
                  id="password"
                  className={`${styles.input}${fieldErrors.password ? ` ${styles.invalid}` : ""}`}
                  value={password}
                  onChange={(e) => {
                    const next = e.target.value;
                    setPassword(next);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  type={passwordHidden ? "password" : "text"}
                  autoComplete="current-password"
                  minLength={6}
                  aria-invalid={fieldErrors.password ? "true" : "false"}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  disabled={twoFactorRequired}
                />
                <button
                  className={styles.inputIconButton}
                  type="button"
                  onClick={() => setPasswordHidden((p) => !p)}
                  aria-label={passwordHidden ? "Show password" : "Hide password"}
                  disabled={twoFactorRequired}
                >
                  <EyeIcon hidden={passwordHidden} />
                </button>
              </div>
              {fieldErrors.password ? (
                <div id="password-error" className={styles.fieldError}>
                  {fieldErrors.password}
                </div>
              ) : null}
            </div>

            {error ? <div className={styles.error}>{error}</div> : null}

            {twoFactorRequired ? (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="twoFactorCode">
                  Authentication code
                </label>
                <div className={styles.inputWrap}>
                  <input
                    id="twoFactorCode"
                    className={styles.input}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="123456"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
                <div className={styles.helperRow}>
                  <button
                    className={styles.helperLink}
                    type="button"
                    onClick={() => {
                      setTwoFactorRequired(false);
                      setChallengeToken(null);
                      setTwoFactorCode("");
                      setError(null);
                    }}
                  >
                    Back to login
                  </button>
                </div>
              </div>
            ) : null}

            {!twoFactorRequired ? (
              <div className={styles.helperRow}>
                <label className={styles.remember}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link className={styles.helperLink} href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
            ) : null}

            <div className={styles.actions}>
              <button className={styles.buttonPrimary} type="submit" disabled={loading}>
                {loading ? "Please wait..." : twoFactorRequired ? "Verify" : "Login"}
              </button>
            </div>
          </form>

          <div className={styles.bottomLink}>
            Don&apos;t have an account?{" "}
            <Link className={styles.helperLink} href="/register">
              Sign up
            </Link>
          </div>
        </main>

        <div className={styles.featuresRow} aria-label="Highlights">
          <div className={styles.featureItem}>
            <div className={styles.featureIcon} aria-hidden>
              🛡️
            </div>
            <div className={styles.featureText}>Secure &amp; Safe</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon} aria-hidden>
              🕒
            </div>
            <div className={styles.featureText}>24/7 Support</div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon} aria-hidden>
              🧭
            </div>
            <div className={styles.featureText}>Plan Smarter</div>
          </div>
        </div>

        <div className={styles.statsPills} aria-label="Stats">
          <div className={styles.statPill}>
            <div className={styles.statBig}>50,000+</div>
            <div className={styles.statSmall}>Hotels</div>
          </div>
          <div className={styles.statPill}>
            <div className={styles.statBig}>Exciting</div>
            <div className={styles.statSmall}>Activities</div>
          </div>
        </div>
      </div>
    </div>
  );
}
