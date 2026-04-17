import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function TermsPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Terms & Conditions</h1>
            <p className={styles.sectionSub}>
              High-level terms for using BlessedToursZim.
            </p>
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Platform terms</div>
            <div className={styles.cardText}>
              By using the platform, you agree to follow our rules and policies.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Bookings</div>
            <div className={styles.cardText}>
              Availability, pricing, and confirmations depend on the listing.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Liability</div>
            <div className={styles.cardText}>
              Experiences are provided by vendors. Always follow safety guidance.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
