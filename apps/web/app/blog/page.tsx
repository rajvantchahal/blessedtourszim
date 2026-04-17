import Link from "next/link";

import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

const posts = [
  {
    title: "How to plan a stay + experience weekend",
    excerpt: "A simple checklist to book your hotel and activities together.",
  },
  {
    title: "Top destinations in Zimbabwe to visit",
    excerpt: "From iconic wonders to hidden gems — build your next itinerary.",
  },
  {
    title: "What to look for when booking tours",
    excerpt: "A quick guide to picking experiences that match your travel style.",
  },
];

export default function BlogPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Blog</h1>
            <p className={styles.sectionSub}>
              Tips, guides, and inspiration for better trips.
            </p>
          </div>
          <Link className={styles.link} href="/destinations">
            Browse destinations
          </Link>
        </div>

        <div className={styles.grid}>
          {posts.map((p) => (
            <div key={p.title} className={styles.card}>
              <div className={styles.cardTitle}>{p.title}</div>
              <div className={styles.cardText}>{p.excerpt}</div>
              <div className={styles.cardMeta}>
                <span>Read time: ~3 min</span>
                <span className={styles.link}>Read</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
