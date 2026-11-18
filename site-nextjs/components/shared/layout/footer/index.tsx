import styles from './footer.module.css'
import { AiFillHeart } from 'react-icons/ai'
import { useLocale } from '../../locale/LocaleProvider'

export default function Footer() {
  const { messages } = useLocale()
  return (
    <footer className={styles.footer}>
      <p className={styles.footerText}>
        {messages.footer.madeWith}{' '}
        <span className="glow">
          <AiFillHeart className={styles.contactLinkIcon} />
        </span>{' '}
        {messages.footer.byAuthor} &nbsp;
        <a className={`glow ${styles.footerLink}`} href="https://github.com/lalrg/site-v2">
          {messages.footer.repositoryLink}
        </a>
      </p>
    </footer>
  )
}
