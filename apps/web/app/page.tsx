import Link from "next/link";

import MarketingShell from "./_components/MarketingShell";
import styles from "./marketing.module.css";

const trendingTrips = [
  {
    pill: "Most loved",
    title: "Stay + Paragliding Adventure",
    where: "Eastern Highlands",
    price: "From $—",
    bg: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
  },
  {
    pill: "Best for families",
    title: "Beach-style Stay with Water Sports",
    where: "Kariba",
    price: "From $—",
    bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  },
  {
    pill: "Top rated",
    title: "Royal Stay & Cultural Tour",
    where: "Great Zimbabwe",
    price: "From $—",
    bg: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80",
  },
  {
    pill: "Adventure seeker",
    title: "Stay + River Rafting",
    where: "Victoria Falls",
    price: "From $—",
    bg: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80",
  },
];

export default function Home() {
  return (
    <MarketingShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.heroTitle}>
              Plan Trips.
              <br />
              <span className={styles.heroTitleAccent}>Stay. Play. Explore.</span>
            </div>
            <p className={styles.heroText}>
              Book Hotels + Discover Nearby Activities.
              <br />
              One Platform. One Memorable Trip.
            </p>
          </div>

          <div className={styles.heroSearch}>
            <div className={styles.stickyBar}>
              <div className={styles.searchGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Where are you going?</span>
                  <input className={styles.input} placeholder="Goa, Manali, Jaipur..." />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Check-in – Check-out</span>
                  <input className={styles.input} placeholder="19 Jan – 25 Jan" />
                </div>
                <div className={styles.field}>
                  <span className={styles.label}>Travelers</span>
                  <input className={styles.input} placeholder="2 Adults, 1 Room" />
                </div>

                <button className={styles.buttonPrimary} type="button">
                  Explore Now
                </button>
              </div>

              <div className={styles.tagRow}>
                <span className={styles.tag}>Popular Searches</span>
                <span className={styles.tag}>Goa</span>
                <span className={styles.tag}>Manali</span>
                <span className={styles.tag}>Jaipur</span>
                <span className={styles.tag}>Rishikesh</span>
                <span className={styles.tag}>Andaman</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.link} style={{ fontSize: 13, fontWeight: 900, letterSpacing: "1.1px" }}>
              WHY CHOOSE BLESSEDTOURSZIM?
            </div>
            <h2 className={styles.sectionTitle}>More Than Just Stays</h2>
            <p className={styles.sectionSub}>We help you plan complete experiences.</p>
          </div>
          <Link className={styles.link} href="/how-it-works">
            Learn more
          </Link>
        </div>

        <div className={styles.fourGrid}>
          <div className={`${styles.toneCard} ${styles.toneCard1}`}>
            <div className={styles.toneTitle}>Handpicked Hotels</div>
            <div className={styles.toneText}>Comfort, quality, and great locations.</div>
          </div>
          <div className={`${styles.toneCard} ${styles.toneCard2}`}>
            <div className={styles.toneTitle}>Exciting Activities</div>
            <div className={styles.toneText}>Sports, events, and local experiences.</div>
          </div>
          <div className={`${styles.toneCard} ${styles.toneCard3}`}>
            <div className={styles.toneTitle}>Perfectly Paired</div>
            <div className={styles.toneText}>Stay close to the action with bundles.</div>
          </div>
          <div className={`${styles.toneCard} ${styles.toneCard4}`}>
            <div className={styles.toneTitle}>Earn & Save</div>
            <div className={styles.toneText}>Save with deals and simple rewards.</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.link} style={{ fontSize: 13, fontWeight: 900, letterSpacing: "1.1px" }}>
              TRENDING NOW
            </div>
            <h2 className={styles.sectionTitle}>Trips People Love</h2>
            <p className={styles.sectionSub}>Popular bundles to kickstart planning.</p>
          </div>
          <Link className={styles.link} href="/combos">
            View all
          </Link>
        </div>

        <div className={styles.tripGrid}>
          {trendingTrips.map((t) => (
            <div
              key={t.title}
              className={styles.tripCard}
              style={{ backgroundImage: `url('${t.bg}')` }}
            >
              <div className={styles.tripContent}>
                <div className={styles.tripPillRow}>
                  <span className={styles.tripPill}>{t.pill}</span>
                  <span className={styles.tripPill} aria-hidden>
                    ♥
                  </span>
                </div>

                <div>
                  <small className={styles.tripSmall}>{t.where}</small>
                  <div className={styles.tripTitle}>{t.title}</div>
                  <div className={styles.tripLine}>Hotel • Stay • Activities</div>
                  <div className={styles.tripFooter}>
                    <span>{t.price}</span>
                    <span>★ 4.8</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.vendorBox}>
          <div>
            <div className={styles.vendorKicker}>FOR VENDORS</div>
            <div className={styles.vendorTitle}>List Your Hotel or Activity & Start Earning Today!</div>
            <div className={styles.vendorText}>
              Reach more travelers, package stays with activities, and grow your bookings.
            </div>
            <Link className={styles.vendorButton} href="/for-hotel-owners">
              List Your Property
            </Link>
          </div>

          <div className={styles.vendorMock} aria-hidden>
            <div className={styles.vendorScreen}>
              <div className={styles.vendorBars}>
                <div className={styles.vendorBar} />
                <div className={styles.vendorBar} />
                <div className={styles.vendorBar} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.link} style={{ fontSize: 13, fontWeight: 900, letterSpacing: "1.1px" }}>
              TRUSTED & SAVED
            </div>
            <h2 className={styles.sectionTitle}>Travelers plan with confidence</h2>
            <p className={styles.sectionSub}>Clear policies, support, and verified listings.</p>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statIcon}>🏨</div>
            <div>
              <strong className={styles.statStrong}>Hotels & Activities</strong>
              <span className={styles.statSpan}>Curated listings</span>
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statIcon}>🕒</div>
            <div>
              <strong className={styles.statStrong}>Support</strong>
              <span className={styles.statSpan}>Fast responses</span>
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statIcon}>🔒</div>
            <div>
              <strong className={styles.statStrong}>Secure</strong>
              <span className={styles.statSpan}>Safer checkout</span>
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statIcon}>⭐</div>
            <div>
              <strong className={styles.statStrong}>Top rated</strong>
              <span className={styles.statSpan}>Trusted by users</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.link} style={{ fontSize: 13, fontWeight: 900, letterSpacing: "1.1px" }}>
              FROM THE BLOG
            </div>
            <h2 className={styles.sectionTitle}>Tips for better trips</h2>
            <p className={styles.sectionSub}>Short reads to help you plan faster.</p>
          </div>
          <Link className={styles.link} href="/blog">
            View blog
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>How to plan a stay + experience weekend</div>
            <div className={styles.cardText}>A quick checklist to book your hotel and activities together.</div>
            <div className={styles.cardMeta}>
              <span>~3 min read</span>
              <Link className={styles.link} href="/blog">
                Read
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Top destinations in Zimbabwe</div>
            <div className={styles.cardText}>Build your itinerary with stays + activities in one place.</div>
            <div className={styles.cardMeta}>
              <span>~4 min read</span>
              <Link className={styles.link} href="/blog">
                Read
              </Link>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>What to look for when booking tours</div>
            <div className={styles.cardText}>Simple tips to pick experiences that match your travel style.</div>
            <div className={styles.cardMeta}>
              <span>~3 min read</span>
              <Link className={styles.link} href="/blog">
                Read
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
