"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import styles from "../auth.module.css";
import { apiPostJson } from "../../lib/api";
import { useToast } from "../_components/ui/toast";

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

function ResetPasswordInner() {
  const router = useRouter();
  const search = useSearchParams();
  const token = useMemo(() => search.get("token") ?? "", [search]);
  const { push } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      push({ title: "Missing token", message: "Open the reset link from your email.", tone: "danger" });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      push({ title: "Password too short", message: "Use at least 6 characters.", tone: "warning" });
      return;
    }

    if (newPassword !== confirm) {
      push({ title: "Passwords do not match", message: "Please re-type the same password.", tone: "warning" });
      return;
    }

    setLoading(true);
    try {
      await apiPostJson<{ ok: boolean }>("/auth/reset-password", { token, newPassword });
      push({ title: "Password updated", message: "You can now login with your new password.", tone: "success" });
      router.push("/login");
    } catch (err) {
      push({
        title: "Reset failed",
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
          <h1 className={styles.title}>Reset password</h1>
          <p className={styles.subtitle}>Create a new password for your account.</p>

          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="newPassword">
                New password
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIconLeft} aria-hidden>
                  <LockIcon />
                </span>
                <input
                  id="newPassword"
                  className={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm">
                Confirm password
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIconLeft} aria-hidden>
                  <LockIcon />
                </span>
                <input
                  id="confirm"
                  className={styles.input}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.buttonPrimary} type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>

          <div className={styles.bottomLink}>
            <Link className={styles.helperLink} href="/login">
              Back to login
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
