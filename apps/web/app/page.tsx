import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandName}>BlessedToursZim</span>
          <span className={styles.brandTag}>Hotels • Sports • Activities</span>
        </div>

        <nav className={styles.nav}>
          <a className={styles.navItem} href="#stays">
            Stays
          </a>
          <a className={styles.navItem} href="#activities">
            Activities
          </a>
          <a className={styles.navItem} href="#deals">
            Deals
          </a>
          <Link className={styles.navLink} href="/login">
            Login
          </Link>
          <Link className={styles.navLinkPrimary} href="/register">
            Create account
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroMedia} aria-hidden>
            <Image
              src="/hero-illustration.svg"
              alt=""
              width={1200}
              height={720}
              className={styles.heroImage}
              priority
            />
          </div>

          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Find stays. Book activities. Travel happier.</h1>
            <p className={styles.heroSubtitle}>
              Discover great hotels and sports activities across Zimbabwe, then book in minutes.
            </p>

            <div className={styles.searchPanel}>
              <div className={styles.searchGrid}>
                <label className={styles.searchField}>
                  <span className={styles.searchLabel}>Destination</span>
                  <input className={styles.searchInput} placeholder="City / resort / landmark" />
                </label>

                <label className={styles.searchField}>
                  <span className={styles.searchLabel}>Check-in</span>
                  <input className={styles.searchInput} type="date" />
                </label>

                <label className={styles.searchField}>
                  <span className={styles.searchLabel}>Check-out</span>
                  <input className={styles.searchInput} type="date" />
                </label>

                <label className={styles.searchField}>
                  <span className={styles.searchLabel}>Guests</span>
                  <input className={styles.searchInput} type="number" min={1} defaultValue={2} />
                </label>

                <div className={styles.searchActions}>
                  <button className={styles.searchButton} type="button">
                    Search
                  </button>
                  <Link className={styles.searchLink} href="/register">
                    Create an account for faster booking
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href="/register">
                Get started
              </Link>
              <Link className={styles.secondaryButton} href="/login">
                I already have an account
              </Link>
            </div>

            <div className={styles.heroMeta}>
              <span className={styles.pill}>Verified vendors</span>
              <span className={styles.pill}>Secure bookings</span>
              <span className={styles.pill}>Fast support</span>
            </div>
          </div>
        </section>

        <section className={styles.tiles}>
          <a id="stays" className={styles.tile} href="#">
            <Image src="/tile-stays.svg" alt="" width={1200} height={800} className={styles.tileImage} />
            <div className={styles.tileContent}>
              <div className={styles.tileKicker}>STAYS</div>
              <div className={styles.tileTitle}>Hotels & resorts</div>
              <div className={styles.tileText}>Find verified stays for every budget.</div>
            </div>
          </a>

          <a id="activities" className={styles.tile} href="#">
            <Image
              src="/tile-activities.svg"
              alt=""
              width={1200}
              height={800}
              className={styles.tileImage}
            />
            <div className={styles.tileContent}>
              <div className={styles.tileKicker}>ACTIVITIES</div>
              <div className={styles.tileTitle}>Sports & adventures</div>
              <div className={styles.tileText}>Book experiences with trusted hosts.</div>
            </div>
          </a>

          <a id="deals" className={styles.tile} href="#">
            <Image src="/tile-deals.svg" alt="" width={1200} height={800} className={styles.tileImage} />
            <div className={styles.tileContent}>
              <div className={styles.tileKicker}>DEALS</div>
              <div className={styles.tileTitle}>Bundles & offers</div>
              <div className={styles.tileText}>Save more when you book together.</div>
            </div>
          </a>
        </section>

        <section className={styles.featured}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Featured right now</h2>
            <p className={styles.sectionSub}>A few popular choices to start with.</p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureBadge}>Top stay</div>
              <div className={styles.featureName}>Victoria Falls weekend</div>
              <div className={styles.featureMeta}>2 nights • Great views</div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureBadge}>Top activity</div>
              <div className={styles.featureName}>Outdoor sports day</div>
              <div className={styles.featureMeta}>Team-friendly • All levels</div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureBadge}>Bundle</div>
              <div className={styles.featureName}>Stay + activities pack</div>
              <div className={styles.featureMeta}>Flexible options</div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerText}>BlessedToursZim</span>
        <span className={styles.footerHint}>Hotels • Sports • Activities</span>
      </footer>
    </div>
  );
}
