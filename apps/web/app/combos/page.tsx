import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

const combos = [
  {
    name: "Weekend City Escape",
    where: "Harare",
    text: "2 nights stay + guided city tour.",
  },
  {
    name: "Falls Adventure Pack",
    where: "Victoria Falls",
    text: "3 nights lodge + sunset cruise.",
  },
  {
    name: "Highlands Nature Break",
    where: "Eastern Highlands",
    text: "2 nights retreat + mountain hike.",
  },
];

export default function CombosPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Stay + Experience Combos</h1>
            <p className={styles.sectionSub}>
              Book a hotel and activities together in one bundle.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {combos.map((c) => (
            <div key={c.name} className={styles.card}>
              <div className={styles.cardTitle}>{c.name}</div>
              <div className={styles.cardText}>{c.text}</div>
              <div className={styles.cardMeta}>
                <span>{c.where}</span>
                <span>From $—</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionTitle}>Why book combos?</div>
            <p className={styles.sectionSub}>
              One checkout, less planning, and clearer value.
            </p>
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Simpler planning</div>
            <div className={styles.cardText}>
              Combine stays and activities without juggling multiple confirmations.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Better value</div>
            <div className={styles.cardText}>
              Bundles can offer better pricing than booking separately.
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Local trust</div>
            <div className={styles.cardText}>
              Verified listings and clear policies for peace of mind.
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
