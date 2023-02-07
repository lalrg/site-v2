import Link from 'next/link'
import styles from './header.module.css'

const HeaderLink = (href: string, text: string) => {
  return <Link href={href} className={styles.link}>{text}</Link>
}

export default function Header() {
  return (
    <header className={`${styles.header}`}>
      <h1 className={styles.title}>Luis Richmond</h1>
      <nav className={styles.nav}>
        {HeaderLink("/", "Home")}
        {HeaderLink("/resume", "Resume")}
        {HeaderLink("/portfolio", "Portfolio")}
        {HeaderLink("/contact", "Contact")}
      </nav>
    </header>
  )
}
