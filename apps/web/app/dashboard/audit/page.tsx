"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "../../_components/ui/Badge";
import { Button } from "../../_components/ui/Button";
import { Card } from "../../_components/ui/Card";
import { Input } from "../../_components/ui/Input";
import { ErrorState, LoadingBlock } from "../../_components/ui/states";
import { apiGetAuthJson } from "../../../lib/api";
import { getToken } from "../../../lib/auth";

import styles from "../dashboard.module.css";

type AuditLog = {
  id: string;
  event: string;
  actorUserId: string;
  targetUserId?: string;
  summary: string;
  createdAt: string;
  ip?: string;
};

type AuditResponse = {
  ok: boolean;
  logs: AuditLog[];
};

export default function AuditPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);

  async function load() {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setLogs([]);
      return;
    }

    setLoading(true);
    try {
      const query = targetUserId.trim() ? `?targetUserId=${encodeURIComponent(targetUserId.trim())}&limit=100` : "?limit=100";
      const data = await apiGetAuthJson<AuditResponse>("/admin/audit-logs" + query, token);
      setLogs(data.logs ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorState title="Audit Logs" description={error} />;

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Audit Logs</h1>
          <p className={styles.sub}>Tracks role/permission changes and approvals.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.link} href="/dashboard">
            Back
          </Link>
        </div>
      </div>

      <Card className={styles.card}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 340px" }}>
            <Input
              label="Filter by targetUserId (optional)"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Mongo userId"
            />
          </div>
          <Button variant="secondary" onClick={load}>
            Search
          </Button>
        </div>
      </Card>

      <div className={styles.grid}>
        {logs.length ? (
          logs.map((l) => (
            <Card key={l.id} className={styles.card}>
              <div className={styles.row}>
                <div>
                  <div className={styles.v} style={{ fontSize: 16, fontWeight: 900 }}>
                    {l.summary}
                  </div>
                  <div className={styles.sub} style={{ marginTop: 4 }}>
                    {l.event} · actor: {l.actorUserId}
                    {l.targetUserId ? ` · target: ${l.targetUserId}` : ""}
                    {l.ip ? ` · ip: ${l.ip}` : ""}
                  </div>
                </div>
                <Badge>{new Date(l.createdAt).toLocaleString()}</Badge>
              </div>
            </Card>
          ))
        ) : (
          <Card className={styles.card}>
            <div className={styles.k}>No logs</div>
            <div className={styles.sub} style={{ marginTop: 6 }}>
              No matching audit entries were found.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
