"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "../auth.module.css";
import { apiPostJson } from "../../lib/api";
import { saveAuth, type AuthResponse } from "../../lib/auth";

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

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11.6 11.6 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 11.6 11.6 0 0 0 .6 3.6 1 1 0 0 1-.2 1Z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="currentColor" d="m9 16.2-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5L9 16.2Z" />
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateRegister(values: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}) {
  const errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    acceptedTerms?: string;
  } = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";

  if (!values.email.trim()) errors.email = "Email is required";
  else if (!isValidEmail(values.email)) errors.email = "Enter a valid email address";

  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 6) errors.password = "Password must be at least 6 characters";

  if (!values.acceptedTerms) errors.acceptedTerms = "Please accept the terms";

  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<"CUSTOMER" | "VENDOR_HOTEL" | "VENDOR_ACTIVITY">(
    "CUSTOMER"
  );
  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    acceptedTerms?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const nextFieldErrors = validateRegister({
      firstName,
      lastName,
      email,
      password,
      acceptedTerms,
    });
    setFieldErrors(nextFieldErrors);
    if (
      nextFieldErrors.firstName ||
      nextFieldErrors.lastName ||
      nextFieldErrors.email ||
      nextFieldErrors.password ||
      nextFieldErrors.acceptedTerms
    ) {
      return;
    }

    setLoading(true);

    try {
      const data = await apiPostJson<AuthResponse>("/auth/register", {
        email,
        password,
        affiliate: false,
        phone: phone.trim() ? phone.trim() : undefined,
        accountType,
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
        <Link className={styles.authLogoLink} href="/" aria-label="Go to homepage">
          <span className={styles.authLogoMark} aria-hidden>
            ✦
          </span>
          <span className={styles.authLogoText}>BlessedToursZim</span>
        </Link>

        <main className={styles.authCard}>
          <h1 className={styles.title}>Create your BlessedToursZim account 🚀</h1>
          <p className={styles.subtitle}>Start planning your dream trips</p>

          <div className={styles.socialButtons}>
            <button className={styles.socialButton} type="button">
              <span className={styles.socialIcon} aria-hidden>
                <GoogleIcon />
              </span>
              Sign up with Google
            </button>
            <button className={styles.socialButton} type="button">
              <span className={styles.socialIcon} aria-hidden>
                <AppleIcon />
              </span>
              Sign up with Apple
            </button>
          </div>

          <div className={styles.divider} aria-hidden>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or</span>
            <span className={styles.dividerLine} />
          </div>

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <div className={styles.nameGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="firstName">
                  First name
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIconLeft} aria-hidden>
                    <UserIcon />
                  </span>
                  <input
                    id="firstName"
                    className={`${styles.input}${fieldErrors.firstName ? ` ${styles.invalid}` : ""}`}
                    value={firstName}
                    onChange={(e) => {
                      const next = e.target.value;
                      setFirstName(next);
                      if (fieldErrors.firstName) setFieldErrors((p) => ({ ...p, firstName: undefined }));
                    }}
                    placeholder="John"
                    autoComplete="given-name"
                    aria-invalid={fieldErrors.firstName ? "true" : "false"}
                    aria-describedby={fieldErrors.firstName ? "first-name-error" : undefined}
                  />
                </div>
                {fieldErrors.firstName ? (
                  <div id="first-name-error" className={styles.fieldError}>
                    {fieldErrors.firstName}
                  </div>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="lastName">
                  Last name
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIconLeft} aria-hidden>
                    <UserIcon />
                  </span>
                  <input
                    id="lastName"
                    className={`${styles.input}${fieldErrors.lastName ? ` ${styles.invalid}` : ""}`}
                    value={lastName}
                    onChange={(e) => {
                      const next = e.target.value;
                      setLastName(next);
                      if (fieldErrors.lastName) setFieldErrors((p) => ({ ...p, lastName: undefined }));
                    }}
                    placeholder="Doe"
                    autoComplete="family-name"
                    aria-invalid={fieldErrors.lastName ? "true" : "false"}
                    aria-describedby={fieldErrors.lastName ? "last-name-error" : undefined}
                  />
                </div>
                {fieldErrors.lastName ? (
                  <div id="last-name-error" className={styles.fieldError}>
                    {fieldErrors.lastName}
                  </div>
                ) : null}
              </div>
            </div>

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
                />
              </div>
              {fieldErrors.email ? (
                <div id="email-error" className={styles.fieldError}>
                  {fieldErrors.email}
                </div>
              ) : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone">
                Phone number (optional)
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIconLeft} aria-hidden>
                  <PhoneIcon />
                </span>
                <input
                  id="phone"
                  className={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+263 ..."
                  inputMode="tel"
                  autoComplete="tel"
                  type="tel"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="accountType">
                Account type
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIconLeft} aria-hidden>
                  <UserIcon />
                </span>
                <select
                  id="accountType"
                  className={styles.select}
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR_HOTEL">Hotel owner</option>
                  <option value="VENDOR_ACTIVITY">Activity owner</option>
                </select>
              </div>
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
                  placeholder="Create a password"
                  type={passwordHidden ? "password" : "text"}
                  autoComplete="new-password"
                  minLength={6}
                  aria-invalid={fieldErrors.password ? "true" : "false"}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <button
                  className={styles.inputIconButton}
                  type="button"
                  onClick={() => setPasswordHidden((p) => !p)}
                  aria-label={passwordHidden ? "Show password" : "Hide password"}
                >
                  <EyeIcon hidden={passwordHidden} />
                </button>
              </div>
              {fieldErrors.password ? (
                <div id="password-error" className={styles.fieldError}>
                  {fieldErrors.password}
                </div>
              ) : null}

              <div className={styles.passwordHints} aria-label="Password requirements">
                <div className={styles.passwordHint}>
                  <span className={styles.passwordCheck} aria-hidden>
                    <CheckIcon />
                  </span>
                  <span>8+ characters</span>
                </div>
                <div className={styles.passwordHint}>
                  <span className={styles.passwordCheck} aria-hidden>
                    <CheckIcon />
                  </span>
                  <span>1 number</span>
                </div>
                <div className={styles.passwordHint}>
                  <span className={styles.passwordCheck} aria-hidden>
                    <CheckIcon />
                  </span>
                  <span>1 uppercase</span>
                </div>
              </div>
            </div>

            <div className={styles.checkboxRow}>
              <input
                id="terms"
                className={styles.checkbox}
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (fieldErrors.acceptedTerms) {
                    setFieldErrors((p) => ({ ...p, acceptedTerms: undefined }));
                  }
                }}
                aria-invalid={fieldErrors.acceptedTerms ? "true" : "false"}
                aria-describedby={fieldErrors.acceptedTerms ? "terms-error" : undefined}
              />
              <label htmlFor="terms">
                I agree to the <Link href="/terms">Terms &amp; Conditions</Link> and{" "}
                <Link href="/privacy">Privacy Policy</Link>
              </label>
            </div>

            {fieldErrors.acceptedTerms ? (
              <div id="terms-error" className={styles.fieldError}>
                {fieldErrors.acceptedTerms}
              </div>
            ) : null}

            {error ? <div className={styles.error}>{error}</div> : null}

            <div className={styles.actions}>
              <button className={styles.buttonPrimary} type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className={styles.bottomLink}>
            Already have an account?{" "}
            <Link className={styles.helperLink} href="/login">
              Login
            </Link>
          </div>
        </main>

        <div className={styles.statsPills} aria-label="Stats">
          <div className={styles.statPill}>
            <div className={styles.statBig}>Secure</div>
            <div className={styles.statSmall}>Payments</div>
          </div>
          <div className={styles.statPill}>
            <div className={styles.statBig}>1M+</div>
            <div className={styles.statSmall}>Travellers</div>
          </div>
        </div>
      </div>
    </div>
  );
}
