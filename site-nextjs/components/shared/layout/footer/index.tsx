import styles from './footer.module.css';

export default function Footer() {
  return (
  <footer className={styles.footer}>
    <p className={styles.footerText}>Copyright {new Date().getFullYear()} Luis Richmond - Software Developer</p>
  </footer>)
}