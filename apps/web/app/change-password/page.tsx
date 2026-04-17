"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "../auth.module.css";
import { apiPostAuthJson } from "../../lib/api";
import { clearAuth, getToken } from "../../lib/auth";
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

export default function ChangePasswordPage() {
  const router = useRouter();
  const { push } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      push({ title: "Not logged in", message: "Please login first.", tone: "warning" });
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await apiPostAuthJson<{ ok: boolean }>(
        "/auth/change-password",
        { currentPassword, newPassword },
        token
      );
      push({ title: "Password changed", message: "Use your new password next time.", tone: "success" });
      clearAuth();
      router.push("/login");
    } catch (err) {
      push({
        title: "Change failed",
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
          <h1 className={styles.title}>Change password</h1>
          <p className={styles.subtitle}>Update your password to keep your account secure.</p>

          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="currentPassword">
                Current password
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIconLeft} aria-hidden>
                  <LockIcon />
                </span>
                <input
                  id="currentPassword"
                  className={styles.input}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a new password"
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
            <Link className={styles.helperLink} href="/">
              Back to home
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
