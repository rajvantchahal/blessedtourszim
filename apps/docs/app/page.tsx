import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>BlessedToursZim Docs</h1>
        <p>Project documentation (API + data model).</p>

        <ol>
          <li>
            Start API server: <code>pnpm --filter server dev</code>
          </li>
          <li>
            Test DB: <code>GET http://127.0.0.1:5000/api/db-status</code>
          </li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="http://127.0.0.1:5000/api/db-status"
            target="_blank"
            rel="noopener noreferrer"
          >
            API: DB status
          </a>
          <a
            className={styles.secondary}
            href="http://127.0.0.1:5000/health"
            target="_blank"
            rel="noopener noreferrer"
          >
            API: health
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a href="/">Home</a>
        <a href="http://127.0.0.1:5000/api/db-status" target="_blank" rel="noopener noreferrer">
          API
        </a>
      </footer>
    </div>
  );
}
