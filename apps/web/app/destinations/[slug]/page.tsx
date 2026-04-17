import Link from "next/link";

import MarketingShell from "../../_components/MarketingShell";
import styles from "../../marketing.module.css";

type Props = {
  params: { slug: string };
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function DestinationDetailsPage({ params }: Props) {
  const name = titleFromSlug(params.slug);

  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>{name}</h1>
            <p className={styles.sectionSub}>
              Curated stays, activities, and bundles for {name}.
            </p>
          </div>
          <Link className={styles.link} href="/destinations">
            Back to destinations
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Hotels</div>
            <div className={styles.cardText}>
              Browse hotels and lodges available in this destination.
            </div>
            <div className={styles.cardMeta}>
              <span>Flexible dates</span>
              <Link className={styles.link} href="/hotels">
                View hotels
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Activities</div>
            <div className={styles.cardText}>
              Explore experiences — from tours to sports and family activities.
            </div>
            <div className={styles.cardMeta}>
              <span>Trusted vendors</span>
              <Link className={styles.link} href="/activities">
                View activities
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Stay + Experience</div>
            <div className={styles.cardText}>
              Book one package to simplify planning and unlock better value.
            </div>
            <div className={styles.cardMeta}>
              <span>Bundles</span>
              <Link className={styles.link} href="/combos">
                View combos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
