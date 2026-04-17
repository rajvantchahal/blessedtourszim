import Link from "next/link";

import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

const destinations = [
  {
    slug: "victoria-falls",
    name: "Victoria Falls",
    blurb: "Iconic views, river cruises, and adventure activities.",
  },
  {
    slug: "harare",
    name: "Harare",
    blurb: "City stays, events, and curated weekend activities.",
  },
  {
    slug: "bulawayo",
    name: "Bulawayo",
    blurb: "Culture, heritage, and nearby nature escapes.",
  },
  {
    slug: "eastern-highlands",
    name: "Eastern Highlands",
    blurb: "Cool mountain getaways, hikes, and scenic stays.",
  },
  {
    slug: "kariba",
    name: "Kariba",
    blurb: "Lake life, houseboats, and family-friendly relaxation.",
  },
  {
    slug: "great-zimbabwe",
    name: "Great Zimbabwe",
    blurb: "History and heritage trips with nearby lodges.",
  },
];

export default function DestinationsPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Destinations</h1>
            <p className={styles.sectionSub}>
              Browse stays and experiences by location.
            </p>
          </div>
          <Link className={styles.link} href="/combos">
            See stay + experience combos
          </Link>
        </div>

        <div className={styles.grid}>
          {destinations.map((d) => (
            <Link key={d.slug} className={styles.card} href={`/destinations/${d.slug}`}>
              <div className={styles.cardTitle}>{d.name}</div>
              <div className={styles.cardText}>{d.blurb}</div>
              <div className={styles.cardMeta}>
                <span>Hotels • Activities</span>
                <span className={styles.link}>Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
