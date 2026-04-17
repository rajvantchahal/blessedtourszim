import Link from "next/link";

import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function ForHotelOwnersPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>For hotel owners</h1>
            <p className={styles.sectionSub}>
              List your property and sell more room nights by bundling with local
              experiences.
            </p>
          </div>
          <Link className={styles.link} href="/contact">
            Contact onboarding
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Reach more travelers</div>
            <div className={styles.cardText}>
              Get discovered alongside activities and destination pages.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Sell combos</div>
            <div className={styles.cardText}>
              Create packages with tours and activities to increase conversion.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Simple tools</div>
            <div className={styles.cardText}>
              Manage listings and availability with clear, predictable workflows.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
