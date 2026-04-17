"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "../_components/ui/Card";
import { Input } from "../_components/ui/Input";
import { Button } from "../_components/ui/Button";
import { ErrorState, LoadingBlock } from "../_components/ui/states";
import { API_BASE_URL } from "../../lib/api";
import styles from "../dashboard/dashboard.module.css";
const NearbyMap = dynamic(() => import("./NearbyMap").then((m) => m.NearbyMap), { ssr: false });

type SearchType = "hotel" | "activity" | "combo";

function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("recentSearches");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(next: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("recentSearches", JSON.stringify(next.slice(0, 8)));
  } catch {
    // ignore
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchType>("hotel");
  const [sort, setSort] = useState<"recommended" | "price" | "rating" | "popularity" | "distance">(
    "recommended"
  );
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [nearby, setNearby] = useState<any[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Demo location: Victoria Falls
  const demoLat = -17.93;
  const demoLng = 25.84;

  const top5 = useMemo(() => results.slice(0, 5), [results]);

  async function loadNearby(nextType: SearchType) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/nearby?type=${encodeURIComponent(nextType)}&lat=${demoLat}&lng=${demoLng}&radius=5000`
      );
      const data = await res.json();
      setNearby(
        (data.results ?? []).map((r: any) => ({
          ...r,
          lat: r.location?.coordinates?.[1],
          lng: r.location?.coordinates?.[0],
        }))
      );
    } catch {
      setNearby([]);
    }
  }

  async function doSearch() {
    setLoading(true);
    setError(null);
    try {
      const trimmed = query.trim();
      const params = new URLSearchParams({ query: trimmed, type, sort });
      const res = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
      const data = (await res.json()) as any;
      setResults(data.results ?? []);
      setSuggestions(data.suggestions ?? []);

      if (trimmed) {
        const next = [trimmed, ...readRecentSearches().filter((x) => x !== trimmed)];
        writeRecentSearches(next);
        setRecentSearches(next.slice(0, 8));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setRecentSearches(readRecentSearches());
    doSearch();
    loadNearby(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadNearby(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const hasFilters = query.trim().length > 0 || type !== "hotel" || sort !== "recommended";

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Search & Discovery</h1>
          <p className={styles.sub}>Find hotels, activities, and combos</p>
        </div>
      </div>
      <div style={{ margin: "18px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select
          className={styles.select}
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          style={{ maxWidth: 160 }}
        >
          <option value="hotel">Hotels</option>
          <option value="activity">Activities</option>
          <option value="combo">Combos</option>
        </select>
        <select
          className={styles.select}
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          style={{ maxWidth: 170 }}
        >
          <option value="recommended">Recommended</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="popularity">Popularity</option>
          <option value="distance">Distance</option>
        </select>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, hotel, activity..."
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") doSearch();
          }}
        />
        <Button onClick={doSearch} disabled={loading}>
          Search
        </Button>
        {hasFilters ? (
          <Button
            variant="secondary"
            onClick={() => {
              setQuery("");
              setType("hotel");
              setSort("recommended");
              setResults([]);
              setSuggestions([]);
            }}
            disabled={loading}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      {recentSearches.length ? (
        <div style={{ marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {recentSearches.slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              className="ds-chip"
              onClick={() => {
                setQuery(s);
                void doSearch();
              }}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      {suggestions.length ? (
        <div style={{ marginBottom: 12, color: "#68718f", fontWeight: 700 }}>
          Suggestions: {suggestions.map((s) => (
            <span key={s} style={{ marginRight: 10 }}>{s}</span>
          ))}
        </div>
      ) : null}

      {!loading && !error && top5.length ? (
        <Card className={styles.card}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Top 5 best matches</div>
          <div style={{ display: "grid", gap: 6 }}>
            {top5.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontWeight: 800 }}>{r.name}</span>
                {typeof r.price === "number" ? <span style={{ fontWeight: 800 }}>${r.price}</span> : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {loading ? <LoadingBlock /> : null}
      {!loading && error ? <ErrorState title="Search error" description={error} /> : null}
      {!loading && !error && results.length === 0 ? (
        <Card className={styles.card}>
          <div style={{ color: "#68718f", fontWeight: 700 }}>No results found. Try a different search or filter.</div>
        </Card>
      ) : null}
      {!loading && !error && results.length ? (
        <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
          {results.map((r) => (
            <Card key={r.id} className={styles.card}>
              <div style={{ display: "flex", gap: 18 }}>
                <img
                  src={r.photoUrl}
                  alt={r.name}
                  style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 12 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{r.name}</div>
                  <div style={{ color: "#68718f", fontWeight: 700 }}>{r.city ?? ""}</div>
                  <div style={{ marginTop: 6 }}>
                    {r.price ? <span style={{ fontWeight: 800 }}>${r.price}</span> : null}
                    {r.star ? <span style={{ marginLeft: 10 }}>⭐ {r.star}</span> : null}
                    {r.amenities ? (
                      <span style={{ marginLeft: 10, color: "#3a888a" }}>
                        {r.amenities.join(", ")}
                      </span>
                    ) : null}
                  </div>
                  {r.verified ? (
                    <span style={{ color: "#3a888a", fontWeight: 800, marginLeft: 10 }}>Verified</span>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <h2 style={{ fontSize: 20, fontWeight: 900, margin: "24px 0 8px" }}>Nearby on Map</h2>
      <NearbyMap lat={demoLat} lng={demoLng} pins={nearby} onPinHover={setHoveredId} onPinSelect={setHoveredId} />
      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        {nearby.map((r) => (
          <div
            key={r.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: hoveredId === r.id ? "#e6f7f7" : "#fff",
              border: hoveredId === r.id ? "2px solid #3a888a" : "1px solid #ececf4",
              borderRadius: 12,
              padding: 8,
              cursor: "pointer",
            }}
            onMouseEnter={() => setHoveredId(r.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <img src={r.photoUrl} alt={r.name} style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{r.name}</div>
              {r.distance ? (
                <span style={{ color: "#3a888a", fontWeight: 700 }}>{(r.distance / 1000).toFixed(1)} km</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
