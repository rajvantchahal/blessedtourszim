"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "../_components/ui/Badge";
import { Button } from "../_components/ui/Button";
import { Card } from "../_components/ui/Card";
import { useToast } from "../_components/ui/toast";
import { ErrorState, LoadingBlock } from "../_components/ui/states";
import { apiGetAuthJson } from "../../lib/api";
import { clearAuth, getToken } from "../../lib/auth";

import styles from "./dashboard.module.css";

type MeResponse = {
  ok: boolean;
  user: { sub: string; roles?: string[] };
  authz?: { userId: string; roles: string[]; permissions: string[] };
};

function hasAny(permissions: readonly string[], required: readonly string[]) {
  return required.some((p) => permissions.includes(p));
}

export default function DashboardPage() {
  const toast = useToast();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setData(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    apiGetAuthJson<MeResponse>("/me", token)
      .then((d) => {
        if (!mounted) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const tokenPresent = typeof window !== "undefined" ? Boolean(getToken()) : false;

  const roles = data?.authz?.roles ?? data?.user?.roles ?? [];
  const permissions = data?.authz?.permissions ?? [];

  const links = useMemo(() => {
    const out: { href: string; label: string; show: boolean }[] = [
      {
        href: "/dashboard/hotels",
        label: "Hotels",
        show: tokenPresent,
      },
      {
        href: "/search",
        label: "Search",
        show: true,
      },
      {
        href: "/dashboard/profile",
        label: "Profile",
        show: tokenPresent,
      },
      {
        href: "/dashboard/security",
        label: "Security",
        show: tokenPresent,
      },
      {
        href: "/dashboard/rbac",
        label: "RBAC",
        show: hasAny(permissions, ["USER_VIEW_ALL", "USER_MANAGE"]),
      },
      {
        href: "/dashboard/approvals",
        label: "Approvals",
        show: hasAny(permissions, ["APPROVALS_VIEW", "APPROVALS_DECIDE"]),
      },
      {
        href: "/dashboard/audit",
        label: "Audit Logs",
        show: hasAny(permissions, ["AUDIT_VIEW"]),
      },
      {
        href: "/dashboard/vendor-team",
        label: "Vendor Team",
        show: hasAny(permissions, ["TEAM_MANAGE"]),
      },
    ];
    return out.filter((x) => x.show);
  }, [permissions, tokenPresent]);

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>Visibility is driven by effective permissions.</p>
        </div>

        <div className={styles.actions}>
          {tokenPresent ? (
            <Button
              variant="secondary"
              onClick={() => {
                clearAuth();
                toast.push({ title: "Signed out", message: "Token cleared on this device." });
                window.location.href = "/login";
              }}
            >
              Sign out
            </Button>
          ) : (
            <Link className={styles.link} href="/login">
              Login
            </Link>
          )}
        </div>
      </div>

      {loading ? <LoadingBlock /> : null}
      {!loading && error ? <ErrorState title="Dashboard error" description={error} /> : null}

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

      {!loading && !error && data && tokenPresent ? (
        <div className={styles.grid}>
          <Card className={`${styles.card} ${styles.cardHalf} ds-card`}>
            <div className={styles.kv}>
              <div className={styles.k}>User</div>
              <div className={styles.v}>{data.user.sub}</div>
            </div>
            <div className={styles.list}>
              {roles.length ? roles.map((r) => <Badge key={r}>{r}</Badge>) : <Badge>NO_ROLE</Badge>}
            </div>
          </Card>

          <Card className={`${styles.card} ${styles.cardHalf} ds-card`}>
            <div className={styles.kv}>
              <div className={styles.k}>Permissions</div>
              <div className={styles.v}>{permissions.length} effective</div>
            </div>
            <div className={styles.list}>
              {permissions.slice(0, 10).map((p) => (
                <Badge key={p}>{p}</Badge>
              ))}
              {permissions.length > 10 ? <Badge>+{permissions.length - 10} more</Badge> : null}
            </div>
          </Card>

          <Card className={`${styles.card} ds-card`}>
            <div className={styles.row}>
              <div>
                <div className={styles.k}>Menu</div>
                <div className={styles.v}>Visible by permission</div>
              </div>
              <div className={styles.nav}>
                {links.length ? (
                  links.map((l) => (
                    <Link key={l.href} className={styles.link} href={l.href}>
                      {l.label}
                    </Link>
                  ))
                ) : (
                  <span className="ds-muted">No privileged modules available for this account.</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
