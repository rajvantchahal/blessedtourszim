import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

const activities = [
  {
    name: "Guided City Tour",
    where: "Harare",
    text: "Half-day guided tour with highlights and local stops.",
  },
  {
    name: "Sunset Cruise",
    where: "Victoria Falls",
    text: "Golden-hour cruise with views and photo opportunities.",
  },
  {
    name: "Mountain Hike",
    where: "Eastern Highlands",
    text: "Scenic hike suitable for most fitness levels.",
  },
];

export default function ActivitiesPage() {
  return (
    <MarketingShell>
      <section className={styles.stickyBar}>
        <div className={styles.searchGrid}>
          <div className={styles.field}>
            <span className={styles.label}>Destination</span>
            <input className={styles.input} placeholder="e.g. Kariba" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Date</span>
            <input className={styles.input} placeholder="Select" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Type</span>
            <input className={styles.input} placeholder="Tour / Sports / Family" />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>People</span>
            <input className={styles.input} placeholder="2" />
          </div>
          <div className={styles.barActions}>
            <div className={styles.chips}>
              <span className={styles.chip}>Instant confirmation</span>
              <span className={styles.chip}>Family friendly</span>
              <span className={styles.chip}>Outdoor</span>
              <span className={styles.chip}>Top rated</span>
            </div>
            <button className={styles.buttonPrimary} type="button">
              Search activities
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>Activities</h1>
            <p className={styles.sectionSub}>
              Discover experiences you can book standalone or as a combo.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          {activities.map((a) => (
            <div key={a.name} className={styles.card}>
              <div className={styles.cardTitle}>{a.name}</div>
              <div className={styles.cardText}>{a.text}</div>
              <div className={styles.cardMeta}>
                <span>{a.where}</span>
                <span>From $—</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
