import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Contact</h1>
            <p className={styles.sectionSub}>
              Questions, partnerships, or onboarding? Reach out.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Support</div>
            <div className={styles.cardText}>
              Booking help, cancellations, refunds, and account questions.
            </div>
            <div className={styles.cardMeta}>
              <span>Email</span>
              <span>support@blessedtourszim.example</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Partners</div>
            <div className={styles.cardText}>
              Hotels and activity vendors — listing and integration.
            </div>
            <div className={styles.cardMeta}>
              <span>Email</span>
              <span>partners@blessedtourszim.example</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Affiliates</div>
            <div className={styles.cardText}>
              Questions about the affiliate program and payouts.
            </div>
            <div className={styles.cardMeta}>
              <span>Email</span>
              <span>affiliates@blessedtourszim.example</span>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
