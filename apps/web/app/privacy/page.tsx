import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Privacy Policy</h1>
            <p className={styles.sectionSub}>
              How we handle personal data and account information.
            </p>
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Data we collect</div>
            <div className={styles.cardText}>
              Account and booking details needed to provide the service.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>How we use it</div>
            <div className={styles.cardText}>
              To process bookings, send confirmations, and provide support.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Your choices</div>
            <div className={styles.cardText}>
              You can request updates or deletion where applicable.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
