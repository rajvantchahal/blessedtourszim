"use client";

import { useEffect, useState } from "react";
import { Card } from "../../_components/ui/Card";
import { Input } from "../../_components/ui/Input";
import { Button } from "../../_components/ui/Button";
import { useToast } from "../../_components/ui/toast";
import { ErrorState, LoadingBlock } from "../../_components/ui/states";
import { apiGetAuthJson, apiPatchAuthJson } from "../../../lib/api";
import { getToken } from "../../../lib/auth";
import styles from "../dashboard.module.css";

export default function ProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const wishlistItems = Array.isArray(profile?.wishlist) ? profile.wishlist : [];
  const tripDrafts = Array.isArray(profile?.tripDrafts) ? profile.tripDrafts : [];
  const bookings = Array.isArray(profile?.bookings) ? profile.bookings : [];
  const coupons = Array.isArray(profile?.coupons) ? profile.coupons : [];
  const paymentMethods = Array.isArray(profile?.paymentMethods) ? profile.paymentMethods : [];
  const reviews = Array.isArray(profile?.reviews) ? profile.reviews : [];
  const loyaltyPoints =
    typeof profile?.loyalty?.points === "number"
      ? profile.loyalty.points
      : typeof profile?.user?.loyaltyPoints === "number"
        ? profile.user.loyaltyPoints
        : 0;

  async function loadProfile() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiGetAuthJson<{ ok: boolean; profile: any }>("/profile", token);
      setProfile(res.profile);
      setEdit({
        firstName: res.profile.user?.firstName ?? "",
        lastName: res.profile.user?.lastName ?? "",
        photoUrl: res.profile.user?.photoUrl ?? "",
        phone: res.profile.user?.phone ?? "",
        language: res.profile.user?.language ?? "",
        currency: res.profile.user?.currency ?? "",
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await apiPatchAuthJson("/profile", edit, token);
      toast.push({ title: "Profile updated" });
      await loadProfile();
    } catch (err) {
      toast.push({ title: "Update failed", message: err instanceof Error ? err.message : "Failed to update" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.sub}>Manage your account and preferences.</p>
        </div>
      </div>
      {loading ? <LoadingBlock /> : null}
      {!loading && error ? <ErrorState title="Profile error" description={error} /> : null}
      {!loading && !error && profile ? (
        <div className={styles.grid}>
          <Card className={`${styles.card} ds-card`}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Personal info</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <Input
                label="First name"
                value={edit.firstName}
                onChange={(e) => setEdit((p: any) => ({ ...p, firstName: e.target.value }))}
                name="firstName"
              />
              <Input
                label="Last name"
                value={edit.lastName}
                onChange={(e) => setEdit((p: any) => ({ ...p, lastName: e.target.value }))}
                name="lastName"
              />
              <Input
                label="Profile photo URL"
                value={edit.photoUrl}
                onChange={(e) => setEdit((p: any) => ({ ...p, photoUrl: e.target.value }))}
                name="photoUrl"
              />
              <Input
                label="Phone"
                value={edit.phone}
                onChange={(e) => setEdit((p: any) => ({ ...p, phone: e.target.value }))}
                name="phone"
              />
              <Input
                label="Language"
                value={edit.language}
                onChange={(e) => setEdit((p: any) => ({ ...p, language: e.target.value }))}
                name="language"
              />
              <Input
                label="Currency"
                value={edit.currency}
                onChange={(e) => setEdit((p: any) => ({ ...p, currency: e.target.value }))}
                name="currency"
              />
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </Card>

          <Card className={`${styles.card} ds-card`}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Continue planning your trip</h2>
            {tripDrafts.length === 0 ? (
              <div className="ds-muted">No saved trip drafts yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {tripDrafts.slice(0, 5).map((d: any, idx: number) => (
                  <div key={d._id ?? d.id ?? idx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 800 }}>{d.title ?? d.name ?? "Trip draft"}</div>
                    <div className="ds-muted">
                      {d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className={`${styles.card} ds-card`}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Wishlist</h2>
            {wishlistItems.length === 0 ? (
              <div className="ds-muted">No saved items yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {wishlistItems.slice(0, 8).map((it: any, idx: number) => (
                  <div key={it.id ?? it._id ?? `${it.type ?? "item"}-${idx}`} style={{ display: "flex", gap: 10 }}>
                    <span className="ds-badge">{String(it.type ?? "saved")}</span>
                    <span style={{ fontWeight: 800 }}>{String(it.name ?? it.title ?? it.refId ?? it.hotelId ?? it.activityId ?? "Item")}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className={`${styles.card} ds-card`}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Bookings</h2>
            {bookings.length === 0 ? (
              <div className="ds-muted">No bookings yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {bookings.slice(0, 8).map((b: any, idx: number) => (
                  <div key={b._id ?? b.id ?? idx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{String(b.type ?? "BOOKING")}</div>
                      <div className="ds-muted">{String(b.status ?? "")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {typeof b.totalAmount === "number" ? (
                        <div style={{ fontWeight: 900 }}>
                          {b.currency ? String(b.currency) + " " : ""}{b.totalAmount}
                        </div>
                      ) : null}
                      <div className="ds-muted">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className={`${styles.card} ds-card`}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Loyalty & Rewards</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>Points balance: {loyaltyPoints}</div>
              {coupons.length === 0 ? (
                <div className="ds-muted">No coupons yet.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {coupons.slice(0, 6).map((c: any, idx: number) => (
                    <div key={c._id ?? c.code ?? idx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 800 }}>{String(c.code ?? c.name ?? "COUPON")}</div>
                      <div className="ds-muted">{String(c.status ?? "")}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
          <Card className={`${styles.card} ds-card`}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Reviews</h2>
            {reviews.length === 0 ? (
              <div className="ds-muted">No reviews yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {reviews.slice(0, 6).map((r: any, idx: number) => (
                  <div key={r._id ?? idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>{String(r.title ?? r.targetName ?? "Review")}</div>
                      <div className="ds-muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</div>
                    </div>
                    {typeof r.rating === "number" ? <div className="ds-muted">Rating: {r.rating}</div> : null}
                    {typeof r.text === "string" ? <div className="ds-muted">{r.text}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className={`${styles.card} ds-card`}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Payment Methods</h2>
            {paymentMethods.length === 0 ? (
              <div className="ds-muted">No saved payment methods yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {paymentMethods.slice(0, 6).map((p: any, idx: number) => (
                  <div key={p._id ?? idx} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 900 }}>{String(p.label ?? p.type ?? "Payment method")}</div>
                    <div className="ds-muted">{String(p.last4 ?? p.masked ?? "")}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className={`${styles.card} ds-card`}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>Notifications & Privacy</h2>
            <div className="ds-muted">
              {profile.notificationSettings && Object.keys(profile.notificationSettings).length
                ? JSON.stringify(profile.notificationSettings)
                : "No notification settings saved yet."}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
