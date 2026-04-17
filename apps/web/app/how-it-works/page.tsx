import Link from "next/link";

import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>How it works</h1>
            <p className={styles.sectionSub}>
              Search, compare, and book stays + activities.
            </p>
          </div>
          <Link className={styles.link} href="/register">
            Create an account
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>1) Search</div>
            <div className={styles.cardText}>
              Pick a destination, dates, and the type of experience you want.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>2) Choose</div>
            <div className={styles.cardText}>
              Book hotels, activities, or a combo bundle.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>3) Confirm</div>
            <div className={styles.cardText}>
              Get confirmation details and keep everything in one place.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
