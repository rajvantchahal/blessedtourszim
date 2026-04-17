"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "../../_components/ui/Badge";
import { Button } from "../../_components/ui/Button";
import { Card } from "../../_components/ui/Card";
import { Input } from "../../_components/ui/Input";
import { useToast } from "../../_components/ui/toast";
import { ErrorState, LoadingBlock } from "../../_components/ui/states";
import { apiGetAuthJson, apiPatchAuthJson, apiPostAuthJson } from "../../../lib/api";
import { getToken } from "../../../lib/auth";

import styles from "../dashboard.module.css";

type TeamMember = {
  id: string;
  email: string;
  roles: string[];
  vendorOwnerUserId?: string;
};

type TeamResponse = {
  ok: boolean;
  members: TeamMember[];
};

export default function VendorTeamPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [email, setEmail] = useState("");
  const [type, setType] = useState<"HOTEL" | "ACTIVITY">("HOTEL");

  async function load() {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setMembers([]);
      return;
    }

    setLoading(true);
    try {
      const data = await apiGetAuthJson<TeamResponse>("/vendor/team", token);
      setMembers(data.members ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vendor team");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addManager() {
    const token = getToken();
    if (!token) return;

    try {
      await apiPostAuthJson("/vendor/team/managers", { email, type }, token);
      toast.push({ title: "Added", message: "Manager role assigned." });
      setEmail("");
      await load();
    } catch (e) {
      toast.push({ title: "Add failed", message: e instanceof Error ? e.message : "Request failed", tone: "danger" });
    }
  }

  async function removeManager(memberId: string) {
    const token = getToken();
    if (!token) return;

    try {
      await apiPatchAuthJson(`/vendor/team/managers/${encodeURIComponent(memberId)}/remove`, { type }, token);
      toast.push({ title: "Removed", message: "Manager role removed." });
      await load();
    } catch (e) {
      toast.push({ title: "Remove failed", message: e instanceof Error ? e.message : "Request failed", tone: "danger" });
    }
  }

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorState title="Vendor Team" description={error} />;

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vendor Team</h1>
          <p className={styles.sub}>Assign sub-users as hotel/activity managers.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.link} href="/dashboard">
            Back
          </Link>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      <Card className={styles.card}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 340px" }}>
            <Input
              label="User email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@example.com"
            />
          </div>
          <div style={{ minWidth: 200 }}>
            <div className="ds-label">Type</div>
            <select
              className="ds-input"
              style={{ paddingLeft: 14, paddingRight: 14 }}
              value={type}
              onChange={(e) => setType(e.target.value === "ACTIVITY" ? "ACTIVITY" : "HOTEL")}
            >
              <option value="HOTEL">Hotel</option>
              <option value="ACTIVITY">Activity</option>
            </select>
          </div>
          <Button onClick={addManager} disabled={!email.trim()}>
            Add manager
          </Button>
        </div>
      </Card>

      <div className={styles.grid}>
        {members.length ? (
          members.map((m) => (
            <Card key={m.id} className={styles.card}>
              <div className={styles.row}>
                <div>
                  <div className={styles.v} style={{ fontSize: 16, fontWeight: 900 }}>
                    {m.email}
                  </div>
                  <div className={styles.sub} style={{ marginTop: 4 }}>
                    id: {m.id}
                  </div>
                  <div className={styles.list}>
                    {(m.roles ?? []).map((r) => (
                      <Badge key={r}>{r}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => removeManager(m.id)}>
                  Remove ({type})
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className={styles.card}>
            <div className={styles.k}>No team members</div>
            <div className={styles.sub} style={{ marginTop: 6 }}>
              Assign a manager by email to start.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
