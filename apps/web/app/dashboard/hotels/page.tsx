"use client";

import { useEffect, useState } from "react";
import { Card } from "../../_components/ui/Card";
import { Button } from "../../_components/ui/Button";
import { ErrorState, LoadingBlock } from "../../_components/ui/states";
import styles from "../dashboard.module.css";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHotels() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/hotels");
      const data = await res.json();
      setHotels(data.hotels ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Hotels</h1>
          <p className={styles.sub}>Manage your properties and listings</p>
        </div>
        <div className={styles.actions}>
          <Button>Add Hotel</Button>
        </div>
      </div>
      {loading ? <LoadingBlock /> : null}
      {!loading && error ? <ErrorState title="Hotels error" description={error} /> : null}
      {!loading && !error && hotels.length === 0 ? (
        <Card className={styles.card}>
          <div className="ds-muted">No hotels found. Click "Add Hotel" to create your first property.</div>
        </Card>
      ) : null}
      {!loading && !error && hotels.length ? (
        <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
          {hotels.map((h) => (
            <Card key={h.id} className={styles.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{h.name}</div>
                  <div style={{ color: "#68718f", fontWeight: 700 }}>{h.city ?? ""}</div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontWeight: 800 }}>{h.status}</span>
                    <span style={{ marginLeft: 10, color: h.approvalStatus === "APPROVED" ? "#3a888a" : "#e6a23c" }}>
                      {h.approvalStatus}
                    </span>
                  </div>
                </div>
                <Button variant="secondary">Edit</Button>
                <Button variant="ghost">Preview</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
