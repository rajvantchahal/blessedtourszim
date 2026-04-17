"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "../../_components/ui/Badge";
import { Button } from "../../_components/ui/Button";
import { Card } from "../../_components/ui/Card";
import { Input } from "../../_components/ui/Input";
import { useToast } from "../../_components/ui/toast";
import { ErrorState, LoadingBlock } from "../../_components/ui/states";
import { apiGetAuthJson, apiPatchAuthJson } from "../../../lib/api";
import { getToken } from "../../../lib/auth";

import styles from "../dashboard.module.css";

type AdminRbacResponse = {
  ok: boolean;
  roles: string[];
  permissions: string[];
};

type AdminRolesResponse = {
  ok: boolean;
  roles: { role: string; permissions: string[]; source: "default" | "override" }[];
};

type MutationOk =
  | { ok: true; status?: undefined; approvalId?: undefined }
  | { ok: true; status: "PENDING_APPROVAL"; approvalId: string };

function parseList(value: string) {
  return value
    .split(/[,\n]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function group(permission: string) {
  if (permission.startsWith("BOOKING_")) return "Bookings";
  if (permission.startsWith("HOTEL_") || permission.startsWith("ACTIVITY_") || permission.startsWith("LISTING_"))
    return "Listings";
  if (permission.includes("VENDOR")) return "Vendor";
  if (permission.startsWith("USER_")) return "Users";
  if (permission.startsWith("APPROVAL")) return "Approvals";
  if (permission.startsWith("AUDIT")) return "Audit";
  if (permission.startsWith("TEAM")) return "Team";
  return "Other";
}

export default function RbacPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matrix, setMatrix] = useState<AdminRbacResponse | null>(null);
  const [rolesData, setRolesData] = useState<AdminRolesResponse | null>(null);

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [rolePerms, setRolePerms] = useState<string[]>([]);

  const [targetUserId, setTargetUserId] = useState("");
  const [targetRolesCsv, setTargetRolesCsv] = useState("");
  const [grantCsv, setGrantCsv] = useState("");
  const [denyCsv, setDenyCsv] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setMatrix(null);
      setRolesData(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    Promise.all([
      apiGetAuthJson<AdminRbacResponse>("/admin/rbac", token),
      apiGetAuthJson<AdminRolesResponse>("/admin/roles", token),
    ])
      .then(([m, r]) => {
        if (!mounted) return;
        setMatrix(m);
        setRolesData(r);
        const first = r.roles[0]?.role ?? "";
        setSelectedRole(first);
        setRolePerms(r.roles.find((x) => x.role === first)?.permissions ?? []);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load RBAC");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const allPermissions = matrix?.permissions ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of allPermissions) {
      const g = group(p);
      const list = map.get(g) ?? [];
      list.push(p);
      map.set(g, list);
    }
    return [...map.entries()].map(([k, v]) => ({ group: k, permissions: v.sort() })).sort((a, b) => a.group.localeCompare(b.group));
  }, [allPermissions]);

  async function saveRoleOverride() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await apiPatchAuthJson<MutationOk>(
        `/admin/roles/${encodeURIComponent(selectedRole)}/permissions`,
        { permissions: rolePerms },
        token
      );

      if ("status" in res && res.status === "PENDING_APPROVAL") {
        toast.push({
          title: "Sent for approval",
          message: `Approval required. ID: ${res.approvalId}`,
          tone: "warning",
        });
      } else {
        toast.push({ title: "Saved", message: "Role permissions updated." });
      }

      const r = await apiGetAuthJson<AdminRolesResponse>("/admin/roles", token);
      setRolesData(r);
    } catch (e) {
      toast.push({
        title: "Save failed",
        message: e instanceof Error ? e.message : "Request failed",
        tone: "danger",
      });
    }
  }

  async function updateUserRoles() {
    const token = getToken();
    if (!token) return;

    try {
      const roles = parseList(targetRolesCsv);
      const res = await apiPatchAuthJson<MutationOk>(`/admin/users/${encodeURIComponent(targetUserId)}/roles`, { roles }, token);
      if ("status" in res && res.status === "PENDING_APPROVAL") {
        toast.push({ title: "Sent for approval", message: `Approval ID: ${res.approvalId}`, tone: "warning" });
      } else {
        toast.push({ title: "Updated", message: "User roles updated." });
      }
    } catch (e) {
      toast.push({ title: "Update failed", message: e instanceof Error ? e.message : "Request failed", tone: "danger" });
    }
  }

  async function updateUserPerms() {
    const token = getToken();
    if (!token) return;

    try {
      const grant = parseList(grantCsv);
      const deny = parseList(denyCsv);
      const res = await apiPatchAuthJson<MutationOk>(
        `/admin/users/${encodeURIComponent(targetUserId)}/permissions`,
        { grant, deny },
        token
      );
      if ("status" in res && res.status === "PENDING_APPROVAL") {
        toast.push({ title: "Sent for approval", message: `Approval ID: ${res.approvalId}`, tone: "warning" });
      } else {
        toast.push({ title: "Updated", message: "User permission overrides updated." });
      }
    } catch (e) {
      toast.push({ title: "Update failed", message: e instanceof Error ? e.message : "Request failed", tone: "danger" });
    }
  }

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorState title="RBAC" description={error} />;

  if (!matrix || !rolesData) {
    return (
      <div className={styles.shell}>
        <Card className={styles.card}>
          <div className={styles.row}>
            <div>
              <div className={styles.k}>RBAC</div>
              <div className={styles.v}>Login required</div>
            </div>
            <Link className={styles.link} href="/login">
              Login
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>RBAC</h1>
          <p className={styles.sub}>Permission matrix + custom overrides (approval may be required).</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.link} href="/dashboard">
            Back
          </Link>
          <Link className={styles.link} href="/dashboard/approvals">
            Approvals
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        <Card className={`${styles.card} ${styles.cardHalf}`}>
          <div className={styles.k}>Select role</div>
          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              className="ds-input"
              style={{ maxWidth: 380, paddingLeft: 14, paddingRight: 14 }}
              value={selectedRole}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedRole(next);
                setRolePerms(rolesData.roles.find((x) => x.role === next)?.permissions ?? []);
              }}
            >
              {rolesData.roles.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.role} ({r.source})
                </option>
              ))}
            </select>
            <Button onClick={saveRoleOverride} variant="primary">
              Save permissions
            </Button>
          </div>

          <div className={styles.list}>
            {rolePerms.map((p) => (
              <Badge key={p}>{p}</Badge>
            ))}
          </div>
        </Card>

        <Card className={`${styles.card} ${styles.cardHalf}`}>
          <div className={styles.k}>User overrides</div>
          <div className={styles.sub} style={{ marginTop: 6 }}>
            Update a specific user by ID (roles, grant/deny permissions).
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <Input label="Target userId" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
            <Input
              label="Roles (comma or newline separated)"
              value={targetRolesCsv}
              onChange={(e) => setTargetRolesCsv(e.target.value)}
              placeholder="SUPER_ADMIN, SUPPORT_AGENT"
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={updateUserRoles} disabled={!targetUserId.trim()}>
                Update roles
              </Button>
            </div>

            <Input
              label="Grant permissions (comma/newline)"
              value={grantCsv}
              onChange={(e) => setGrantCsv(e.target.value)}
              placeholder="USER_VIEW_ALL"
            />
            <Input
              label="Deny permissions (comma/newline)"
              value={denyCsv}
              onChange={(e) => setDenyCsv(e.target.value)}
              placeholder="USER_MANAGE"
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={updateUserPerms} disabled={!targetUserId.trim()}>
                Update permission overrides
              </Button>
            </div>
          </div>
        </Card>

        <Card className={styles.card}>
          <div className={styles.k}>Permission matrix</div>
          <div className={styles.sub} style={{ marginTop: 6 }}>
            Toggle permissions for the selected role.
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 14 }}>
            {grouped.map((g) => (
              <div key={g.group}>
                <div className={styles.k} style={{ marginBottom: 8 }}>
                  {g.group}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
                  {g.permissions.map((p) => {
                    const checked = rolePerms.includes(p);
                    return (
                      <label
                        key={p}
                        className="ds-chip"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setRolePerms((prev) =>
                              prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
                            );
                          }}
                        />
                        <span style={{ fontWeight: 900 }}>{p}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
