import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>About</h1>
            <p className={styles.sectionSub}>
              BlessedToursZim helps travelers book stays and experiences in one
              place.
            </p>
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Stay + Experience</div>
            <div className={styles.cardText}>
              We connect hotels, activity vendors, and travelers so trips are
              easier to plan.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Local partners</div>
            <div className={styles.cardText}>
              Listings are built with local vendors to keep offerings relevant.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Simple bookings</div>
            <div className={styles.cardText}>
              Clear pricing, clear policies, and one place to manage your plans.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
