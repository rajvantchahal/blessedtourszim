import Link from "next/link";

import MarketingShell from "../_components/MarketingShell";
import styles from "../marketing.module.css";

const faqs = [
  {
    q: "Can I book only a hotel or only an activity?",
    a: "Yes. You can book hotels and activities separately, or combine them into a bundle.",
  },
  {
    q: "Do you offer refunds?",
    a: "Refund eligibility depends on the listing policy. See the refund policy page for details.",
    link: { href: "/refund", text: "Refund policy" },
  },
  {
    q: "How do cancellations work?",
    a: "Cancellation windows and fees vary by listing. Check the cancellation policy page.",
    link: { href: "/cancellation", text: "Cancellation policy" },
  },
  {
    q: "Are vendors verified?",
    a: "We aim to keep listings accurate with clear policies and trust indicators.",
  },
];

export default function FAQsPage() {
  return (
    <MarketingShell>
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h1 className={styles.sectionTitle}>FAQs</h1>
            <p className={styles.sectionSub}>Common questions and answers.</p>
          </div>
        </div>

        <div className={styles.grid}>
          {faqs.map((f) => (
            <div key={f.q} className={styles.card}>
              <div className={styles.cardTitle}>{f.q}</div>
              <div className={styles.cardText}>{f.a}</div>
              {f.link ? (
                <div className={styles.cardMeta}>
                  <span />
                  <Link className={styles.link} href={f.link.href}>
                    {f.link.text}
                  </Link>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
