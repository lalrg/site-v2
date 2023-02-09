import Link from 'next/link'
import styles from './header.module.css'
import { NextRouter, useRouter } from 'next/router';

const HeaderLink = (href: string, text: string, router: NextRouter) => {
  return (
    <Link href={href} className={`${styles.link} ${router.pathname === href ? styles.linkActive : ""}`}>
      {text}
    </Link>)
}

export default function Header() {
  const router = useRouter();
  return (
    <header className={`${styles.header}`}>
      <p className={styles.title}>Luis Richmond</p>
      <nav className={styles.nav}>
        {HeaderLink("/", "Home", router)}
        {HeaderLink("/resume", "Resume", router)}
        {HeaderLink("/portfolio", "Portfolio", router)}
        {HeaderLink("/contact", "Contact", router)}
      </nav>
    </header>
  )
}
