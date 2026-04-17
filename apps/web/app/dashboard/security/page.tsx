"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "../../_components/ui/Badge";
import { Button } from "../../_components/ui/Button";
import { Card } from "../../_components/ui/Card";
import { Input } from "../../_components/ui/Input";
import { useToast } from "../../_components/ui/toast";
import { ErrorState, LoadingBlock } from "../../_components/ui/states";
import { apiGetAuthJson, apiPostAuthJson, apiPostJson } from "../../../lib/api";
import { clearAuth, getToken } from "../../../lib/auth";

import styles from "../dashboard.module.css";

type AccountResponse = {
  ok: boolean;
  account: {
    email?: string;
    emailVerified: boolean;
    phone: string | null;
    phoneVerified: boolean;
    twoFactorEnabled: boolean;
  };
};

type SessionsResponse = {
  ok: boolean;
  sessions: {
    id: string;
    sessionId: string;
    createdAt: string;
    lastSeenAt?: string;
    revokedAt?: string | null;
    ip?: string;
    userAgent?: string;
  }[];
};

type SecurityEventsResponse = {
  ok: boolean;
  events: { id: string; type: string; summary: string; createdAt: string; ip?: string }[];
};

type EmailVerificationSendResponse = { ok: boolean; message?: string; devEmailVerificationToken?: string };

type PhoneOtpResponse = { ok: boolean; message?: string; devOtp?: string };

type TwoFactorSetupResponse = { ok: boolean; secretBase32: string; otpauthUrl: string };

type OkResponse = { ok: boolean };

export default function SecurityPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [account, setAccount] = useState<AccountResponse["account"] | null>(null);
  const [sessions, setSessions] = useState<SessionsResponse["sessions"]>([]);
  const [events, setEvents] = useState<SecurityEventsResponse["events"]>([]);

  const [devEmailToken, setDevEmailToken] = useState<string | null>(null);
  const [verifyEmailToken, setVerifyEmailToken] = useState("");

  const [phone, setPhone] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  async function refreshAll() {
    const token = getToken();
    if (!token) {
      setAccount(null);
      setSessions([]);
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [a, s, e] = await Promise.all([
        apiGetAuthJson<AccountResponse>("/auth/account", token),
        apiGetAuthJson<SessionsResponse>("/auth/sessions", token),
        apiGetAuthJson<SecurityEventsResponse>("/auth/security-events", token),
      ]);

      setAccount(a.account);
      setSessions(s.sessions);
      setEvents(e.events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tokenPresent = typeof window !== "undefined" ? Boolean(getToken()) : false;

  const activeSessions = useMemo(() => sessions.filter((s) => !s.revokedAt), [sessions]);

  async function sendEmailVerification() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await apiPostAuthJson<EmailVerificationSendResponse>("/auth/send-email-verification", {}, token);
      setDevEmailToken(res.devEmailVerificationToken ?? null);
      toast.push({ title: "Email verification", message: res.message ?? "Verification requested." });
    } catch (err) {
      toast.push({ title: "Email verification failed", message: err instanceof Error ? err.message : "Request failed" });
    }
  }

  async function verifyEmail() {
    const token = verifyEmailToken.trim();
    if (!token) return;

    try {
      await apiPostJson<OkResponse>("/auth/verify-email", { token });
      toast.push({ title: "Email verified", message: "Your email has been verified." });
      setVerifyEmailToken("");
      setDevEmailToken(null);
      await refreshAll();
    } catch (err) {
      toast.push({ title: "Verify email failed", message: err instanceof Error ? err.message : "Request failed" });
    }
  }

  async function requestPhoneOtp() {
    const token = getToken();
    if (!token) return;

    const phoneValue = phone.trim();
    if (!phoneValue) {
      toast.push({ title: "Phone required", message: "Enter a phone number first." });
      return;
    }

    try {
      const res = await apiPostAuthJson<PhoneOtpResponse>("/auth/request-phone-otp", { phone: phoneValue }, token);
      setDevOtp(res.devOtp ?? null);
      toast.push({ title: "OTP requested", message: res.message ?? "OTP requested." });
    } catch (err) {
      toast.push({ title: "OTP request failed", message: err instanceof Error ? err.message : "Request failed" });
    }
  }

  async function verifyPhoneOtp() {
    const token = getToken();
    if (!token) return;

    const phoneValue = phone.trim();
    const code = otpCode.trim();
    if (!phoneValue || !code) {
      toast.push({ title: "Phone + code required", message: "Enter phone and the 6-digit code." });
      return;
    }

    try {
      await apiPostAuthJson<OkResponse>("/auth/verify-phone-otp", { phone: phoneValue, code }, token);
      toast.push({ title: "Phone verified", message: "Your phone number has been verified." });
      setOtpCode("");
      setDevOtp(null);
      await refreshAll();
    } catch (err) {
      toast.push({ title: "Verify failed", message: err instanceof Error ? err.message : "Request failed" });
    }
  }

  async function setupTwoFactor() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await apiPostAuthJson<TwoFactorSetupResponse>("/auth/2fa/setup", {}, token);
      setTwoFactorSetup(res);
      toast.push({ title: "2FA setup", message: "Scan the QR URL in your authenticator, then enable with a code." });
    } catch (err) {
      toast.push({ title: "2FA setup failed", message: err instanceof Error ? err.message : "Request failed" });
    }
  }

  async function enableTwoFactor() {
    const token = getToken();
    if (!token) return;

    const code = twoFactorCode.trim();
    if (!code) {
      toast.push({ title: "Code required", message: "Enter the 6-digit code." });
      return;
    }

    try {
      await apiPostAuthJson<OkResponse>("/auth/2fa/enable", { code }, token);
      toast.push({ title: "2FA enabled", message: "Two-factor authentication is now enabled." });
      setTwoFactorCode("");
      setTwoFactorSetup(null);
      await refreshAll();
    } catch (err) {
      toast.push({ title: "Enable failed", message: err instanceof Error ? err.message : "Request failed" });
    }
  }

  async function disableTwoFactor() {
    const token = getToken();
    if (!token) return;

    const code = twoFactorCode.trim();
    if (!code) {
      toast.push({ title: "Code required", message: "Enter the 6-digit code." });
      return;
    }

    try {
      await apiPostAuthJson<OkResponse>("/auth/2fa/disable", { code }, token);
      toast.push({ title: "2FA disabled", message: "Two-factor authentication is now disabled." });
      setTwoFactorCode("");
      setTwoFactorSetup(null);
      await refreshAll();
    } catch (err) {
      toast.push({ title: "Disable failed", message: err instanceof Error ? err.message : "Request failed" });
    }
  }

  async function revokeSession(sessionId: string) {
    const token = getToken();
    if (!token) return;

    try {
      await apiPostAuthJson<OkResponse>("/auth/sessions/revoke", { sessionId }, token);
      toast.push({ title: "Session revoked", message: "That session has been revoked." });
      await refreshAll();
    } catch (err) {
      toast.push({ title: "Revoke failed", message: err instanceof Error ? err.message : "Request failed" });
    }
  }

  async function logoutCurrent() {
    const token = getToken();
    if (!token) return;

    try {
      await apiPostAuthJson<OkResponse>("/auth/logout", {}, token);
    } catch {
      // ignore
    }

    clearAuth();
    window.location.href = "/login";
  }

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Security</h1>
          <p className={styles.sub}>Sessions, verification, and 2FA.</p>
        </div>

        <div className={styles.actions}>
          <Link className={styles.link} href="/dashboard">
            Back
          </Link>
          {tokenPresent ? (
            <Button variant="secondary" onClick={logoutCurrent}>
              Logout
            </Button>
          ) : (
            <Link className={styles.link} href="/login">
              Login
            </Link>
          )}
        </div>
      </div>

      {loading ? <LoadingBlock /> : null}
      {!loading && error ? <ErrorState title="Security error" description={error} /> : null}

      {!loading && !error && !tokenPresent ? (
        <Card className={`${styles.card} ds-card`}>
          <div className={styles.row}>
            <div className={styles.kv}>
              <div className={styles.k}>Session</div>
              <div className={styles.v}>Not logged in</div>
            </div>
            <Link className={styles.link} href="/login">
              Go to login
            </Link>
          </div>
        </Card>
      ) : null}

      {!loading && !error && tokenPresent ? (
        <div className={styles.grid}>
          <Card className={`${styles.card} ${styles.cardHalf} ds-card`}>
            <div className={styles.kv}>
              <div className={styles.k}>Account</div>
              <div className={styles.v}>{account?.email ?? "—"}</div>
            </div>
            <div className={styles.list}>
              <Badge>{account?.emailVerified ? "EMAIL_VERIFIED" : "EMAIL_UNVERIFIED"}</Badge>
              <Badge>{account?.phoneVerified ? "PHONE_VERIFIED" : "PHONE_UNVERIFIED"}</Badge>
              <Badge>{account?.twoFactorEnabled ? "2FA_ON" : "2FA_OFF"}</Badge>
            </div>
          </Card>

          <Card className={`${styles.card} ${styles.cardHalf} ds-card`}>
            <div className={styles.kv}>
              <div className={styles.k}>Sessions</div>
              <div className={styles.v}>{activeSessions.length} active</div>
            </div>
            <div className={styles.list}>
              {activeSessions.slice(0, 8).map((s) => (
                <Badge key={s.id}>{s.sessionId.slice(0, 8)}…</Badge>
              ))}
              {activeSessions.length > 8 ? <Badge>+{activeSessions.length - 8} more</Badge> : null}
            </div>
          </Card>

          <Card className={`${styles.card} ds-card`}>
            <div className={styles.row}>
              <div>
                <div className={styles.k}>Email verification</div>
                <div className={styles.v}>Confirm ownership of your email</div>
              </div>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={sendEmailVerification}>
                  Send verification
                </Button>
                <Button onClick={verifyEmail} disabled={!verifyEmailToken.trim()}>
                  Verify token
                </Button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <Input
                label="Verification token"
                value={verifyEmailToken}
                onChange={(e) => setVerifyEmailToken(e.target.value)}
                placeholder="Paste token"
                name="verifyEmailToken"
              />

              {devEmailToken ? (
                <div className="ds-muted">Dev token: {devEmailToken}</div>
              ) : null}
            </div>
          </Card>

          <Card className={`${styles.card} ds-card`}>
            <div className={styles.row}>
              <div>
                <div className={styles.k}>Phone verification (OTP)</div>
                <div className={styles.v}>Verify a phone number using an OTP</div>
              </div>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={requestPhoneOtp}>
                  Request OTP
                </Button>
                <Button onClick={verifyPhoneOtp}>
                  Verify OTP
                </Button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+263 ..."
                name="phone"
              />
              <Input
                label="OTP code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                name="otpCode"
              />
              {devOtp ? <div className="ds-muted">Dev OTP: {devOtp}</div> : null}
            </div>
          </Card>

          <Card className={`${styles.card} ds-card`}>
            <div className={styles.row}>
              <div>
                <div className={styles.k}>Two-factor authentication (TOTP)</div>
                <div className={styles.v}>Use an authenticator app for extra security</div>
              </div>
              <div className={styles.actions}>
                <Button variant="secondary" onClick={setupTwoFactor}>
                  Setup
                </Button>
                <Button onClick={account?.twoFactorEnabled ? disableTwoFactor : enableTwoFactor}>
                  {account?.twoFactorEnabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {twoFactorSetup ? (
                <div className="ds-muted">
                  Secret: {twoFactorSetup.secretBase32}
                  <br />
                  otpauth URL: {twoFactorSetup.otpauthUrl}
                </div>
              ) : null}

              <Input
                label="2FA code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                inputMode="numeric"
                name="twoFactorCode"
              />
            </div>
          </Card>

          <Card className={`${styles.card} ds-card`}>
            <div className={styles.kv}>
              <div className={styles.k}>Session history</div>
              <div className={styles.v}>Revoke sessions to force re-login</div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {sessions.length ? (
                sessions.map((s) => (
                  <div key={s.id} className={styles.row}>
                    <div className={styles.kv}>
                      <div className={styles.v}>{s.sessionId}</div>
                      <div className="ds-muted">
                        {s.ip ? `${s.ip} · ` : ""}
                        {s.revokedAt ? `revoked` : "active"}
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        onClick={() => revokeSession(s.sessionId)}
                        disabled={Boolean(s.revokedAt)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ds-muted">No sessions found.</div>
              )}
            </div>
          </Card>

          <Card className={`${styles.card} ds-card`}>
            <div className={styles.kv}>
              <div className={styles.k}>Security events</div>
              <div className={styles.v}>Recent activity</div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {events.length ? (
                events.map((e) => (
                  <div key={e.id} className={styles.row}>
                    <div>
                      <div className={styles.v}>{e.type}</div>
                      <div className="ds-muted">
                        {e.summary}
                        {e.ip ? ` · ${e.ip}` : ""}
                      </div>
                    </div>
                    <Badge>{new Date(e.createdAt).toLocaleString()}</Badge>
                  </div>
                ))
              ) : (
                <div className="ds-muted">No events yet.</div>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
