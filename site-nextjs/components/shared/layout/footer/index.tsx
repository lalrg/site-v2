import styles from './footer.module.css';

export default function Footer() {
  return (
  <footer className={styles.footer}>
    <p className={styles.footerText}>
      Made with <span className='glow'>♥</span> by Luis Richmond - &nbsp;
      <a className={`glow ${styles.footerLink}`} href="https://github.com/lalrg/site-v2">Link to repository</a></p>
  </footer>)
}