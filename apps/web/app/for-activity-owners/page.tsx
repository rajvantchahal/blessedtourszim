import Link from "next/link";

import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function ForActivityOwnersPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>For activity owners</h1>
            <p className={styles.sectionSub}>
              List your experiences and get bookings from travelers planning
              complete trips.
            </p>
          </div>
          <Link className={styles.link} href="/contact">
            Contact onboarding
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>More demand</div>
            <div className={styles.cardText}>
              Show up in destination searches and hotel + activity combos.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Better packaging</div>
            <div className={styles.cardText}>
              Bundle with stays so travelers can book everything in one go.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Trust signals</div>
            <div className={styles.cardText}>
              Clear listings and policies help customers book with confidence.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
