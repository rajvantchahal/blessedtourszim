import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

const hotels = [
  {
    name: "City Comfort Hotel",
    where: "Harare",
    text: "Modern rooms with easy access to downtown activities.",
  },
  {
    name: "Falls View Lodge",
    where: "Victoria Falls",
    text: "Perfect base for adventure activities and sunset cruises.",
  },
  {
    name: "Highlands Retreat",
    where: "Eastern Highlands",
    text: "Quiet mountain escape with nature walks nearby.",
  },
];

export default function HotelsPage() {
  return (
    <MarketingShell>
      <section className={styles.stickyBar}>
        <div className={styles.searchGrid}>
          <div className={styles.field}>
            <span className={styles.label}>Destination</span>
            <input className={styles.input} placeholder="e.g. Victoria Falls" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Check-in</span>
            <input className={styles.input} placeholder="Select" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Check-out</span>
            <input className={styles.input} placeholder="Select" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Guests</span>
            <input className={styles.input} placeholder="2" />
          </div>
          <div className={styles.barActions}>
            <div className={styles.chips}>
              <span className={styles.chip}>Free cancellation</span>
              <span className={styles.chip}>Breakfast</span>
              <span className={styles.chip}>Pool</span>
              <span className={styles.chip}>Family friendly</span>
            </div>
            <button className={styles.buttonPrimary} type="button">
              Search hotels
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Hotels</h1>
            <p className={styles.sectionSub}>
              Find stays that match your trip — then add activities.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {hotels.map((h) => (
            <div key={h.name} className={styles.card}>
              <div className={styles.cardTitle}>{h.name}</div>
              <div className={styles.cardText}>{h.text}</div>
              <div className={styles.cardMeta}>
                <span>{h.where}</span>
                <span>From $—</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
