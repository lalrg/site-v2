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
      <Link className={styles.titleLink} href='/'>
        <p className={`${styles.title} glow`}>Luis Richmond</p>
      </Link>
      <nav className={styles.nav}>
        {HeaderLink("/", "Intro and contact Info", router)}
        {HeaderLink("/resume", "Resume", router)}
        {HeaderLink("/portfolio", "Portfolio", router)}
      </nav>
    </header>
  )
}
