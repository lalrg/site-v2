import styles from './footer.module.css';
import { AiFillHeart } from 'react-icons/ai'

export default function Footer() {
  return (
  <footer className={styles.footer}>
    <p className={styles.footerText}>
      Made with <span className='glow'>
            <AiFillHeart className={styles.contactLinkIcon} />
        </span> by Luis Richmond - &nbsp;
      <a className={`glow ${styles.footerLink}`} href="https://github.com/lalrg/site-v2">Link to repository</a></p>
  </footer>)
}