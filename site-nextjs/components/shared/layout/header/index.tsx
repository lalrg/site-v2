import Link from 'next/link'
import styles from './header.module.css'
import { useRouter } from 'next/router'
import type { NextRouter } from 'next/router'
import LanguageSwitcher from '../../locale/LanguageSwitcher'
import { useLocale } from '../../locale/LocaleProvider'

const HeaderLink = (href: string, text: string, router: NextRouter) => {
  return (
    <Link
      href={href}
      className={`${styles.link} ${router.pathname === href ? styles.linkActive : ''}`}
    >
      {text}
    </Link>
  )
}

export default function Header() {
  const router = useRouter()
  const { messages } = useLocale()
  return (
    <header className={`${styles.header}`}>
      <Link className={styles.titleLink} href="/">
        <p className={`${styles.title} glow`}>Luis Richmond</p>
      </Link>
      <LanguageSwitcher className={styles.languageSwitcher} />
      <nav className={styles.nav}>
        {HeaderLink('/', messages.nav.intro, router)}
        {HeaderLink('/employmentHistory', messages.nav.employmentHistory, router)}
        {HeaderLink('/blogIndex', messages.nav.blog, router)}
      </nav>
    </header>
  )
}
