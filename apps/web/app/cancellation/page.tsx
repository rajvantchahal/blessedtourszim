import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function CancellationPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Cancellation Policy</h1>
            <p className={styles.sectionSub}>
              Cancellation rules depend on the hotel or activity listing.
            </p>
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Listing-specific</div>
            <div className={styles.cardText}>
              Each listing shows its cancellation window and any fees.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Combos</div>
            <div className={styles.cardText}>
              Combo bookings may include policies from multiple vendors.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Support</div>
            <div className={styles.cardText}>
              If you need help, contact support and share your booking reference.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
