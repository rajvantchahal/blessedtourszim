import type { ReactNode } from "react";

import Link from "next/link";

import styles from "../marketing.module.css";

type Props = {
  children: ReactNode;
};

export default function MarketingShell({ children }: Props) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brandLink} href="/">
            <span className={styles.brandBadge} aria-hidden>
              ✦
            </span>
            <span className={styles.brandName}>BlessedToursZim</span>
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <Link className={styles.navItem} href="/destinations">
              Explore
            </Link>
            <Link className={styles.navItem} href="/hotels">
              Hotels
            </Link>
            <Link className={styles.navItem} href="/activities">
              Activities
            </Link>
            <Link className={styles.navItem} href="/combos">
              Deals
            </Link>
            <Link className={styles.navItem} href="/for-hotel-owners">
              For Vendors
            </Link>
          </nav>

          <div className={styles.navActions} aria-label="Account">
            <span className={styles.navMeta}>EN</span>
            <Link className={styles.navMeta} href="/for-hotel-owners">
              List Your Property
            </Link>
            <Link className={styles.navLink} href="/login">
              Sign In
            </Link>
            <Link className={styles.navLinkPrimary} href="/register">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <span className={styles.footerText}>BlessedToursZim</span>
            <span className={styles.footerHint}>Stay • Play • Explore</span>
          </div>

          <nav className={styles.footerLinks} aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/for-hotel-owners">For hotel owners</Link>
            <Link href="/for-activity-owners">For activity owners</Link>
            <Link href="/affiliate">Affiliate</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/cancellation">Cancellation</Link>
            <Link href="/refund">Refund</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
