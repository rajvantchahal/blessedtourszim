"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "../../_components/ui/Badge";
import { Button } from "../../_components/ui/Button";
import { Card } from "../../_components/ui/Card";
import { Input } from "../../_components/ui/Input";
import { useToast } from "../../_components/ui/toast";
import { ErrorState, LoadingBlock } from "../../_components/ui/states";
import { apiGetAuthJson, apiPostAuthJson } from "../../../lib/api";
import { getToken } from "../../../lib/auth";

import styles from "../dashboard.module.css";

type Approval = {
  id: string;
  type: string;
  status: string;
  requestedByUserId: string;
  targetUserId?: string;
  summary: string;
  createdAt: string;
  decidedByUserId?: string;
  decidedAt?: string;
  decisionReason?: string;
};

type ApprovalsResponse = {
  ok: boolean;
  approvals: Approval[];
};

export default function ApprovalsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Approval[]>([]);
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});

  async function load() {
    const token = getToken();
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiGetAuthJson<ApprovalsResponse>("/admin/approvals?status=PENDING&limit=100", token);
      setItems(data.approvals ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve(id: string) {
    const token = getToken();
    if (!token) return;

    try {
      await apiPostAuthJson("/admin/approvals/" + encodeURIComponent(id) + "/approve", {}, token);
      toast.push({ title: "Approved", message: `Approval ${id} executed.` });
      await load();
    } catch (e) {
      toast.push({ title: "Approve failed", message: e instanceof Error ? e.message : "Request failed", tone: "danger" });
    }
  }

  async function reject(id: string) {
    const token = getToken();
    if (!token) return;

    try {
      await apiPostAuthJson(
        "/admin/approvals/" + encodeURIComponent(id) + "/reject",
        { reason: rejectReasonById[id] || "" },
        token
      );
      toast.push({ title: "Rejected", message: `Approval ${id} rejected.` });
      await load();
    } catch (e) {
      toast.push({ title: "Reject failed", message: e instanceof Error ? e.message : "Request failed", tone: "danger" });
    }
  }

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorState title="Approvals" description={error} />;

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Approvals</h1>
          <p className={styles.sub}>Sensitive actions can require Super Admin approval.</p>
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

      <div className={styles.grid}>
        {items.length ? (
          items.map((a) => (
            <Card key={a.id} className={styles.card}>
              <div className={styles.row}>
                <div>
                  <div className={styles.v} style={{ fontSize: 16, fontWeight: 900 }}>
                    {a.summary}
                  </div>
                  <div className={styles.sub} style={{ marginTop: 4 }}>
                    Type: {a.type} · Requested by: {a.requestedByUserId}
                    {a.targetUserId ? ` · Target: ${a.targetUserId}` : ""}
                  </div>
                </div>
                <Badge>{a.status}</Badge>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <Input
                  label="Reject reason (optional)"
                  value={rejectReasonById[a.id] ?? ""}
                  onChange={(e) => setRejectReasonById((p) => ({ ...p, [a.id]: e.target.value }))}
                  placeholder="Reason for rejection"
                />

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button onClick={() => approve(a.id)} variant="primary">
                    Approve
                  </Button>
                  <Button onClick={() => reject(a.id)} variant="secondary">
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className={styles.card}>
            <div className={styles.k}>No pending approvals</div>
            <div className={styles.sub} style={{ marginTop: 6 }}>
              RBAC edits from non-Super-Admins will appear here.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
