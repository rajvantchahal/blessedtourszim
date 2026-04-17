import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function AffiliatePage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Affiliate program</h1>
            <p className={styles.sectionSub}>
              Share BlessedToursZim and earn rewards for qualified bookings.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Promote</div>
            <div className={styles.cardText}>
              Use your link on social, email, or your website.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Track</div>
            <div className={styles.cardText}>
              See clicks and bookings attributed to you.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Earn</div>
            <div className={styles.cardText}>
              Get paid out on agreed affiliate terms.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
