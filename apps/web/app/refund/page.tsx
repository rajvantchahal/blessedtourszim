import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function RefundPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Refund Policy</h1>
            <p className={styles.sectionSub}>
              Refund eligibility depends on the specific booking and policy.
            </p>
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Eligible cases</div>
            <div className={styles.cardText}>
              Refunds can apply based on cancellation windows or vendor policies.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Processing</div>
            <div className={styles.cardText}>
              Processing times can vary depending on payment provider and vendor.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Help</div>
            <div className={styles.cardText}>
              Contact support with your booking reference to check eligibility.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
