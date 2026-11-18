import styles from '../pagesStyles/index.module.css'
import { TfiGithub, TfiLinkedin, TfiTwitterAlt } from 'react-icons/tfi'
import Link from 'next/link'
import { useLocale } from '../components/shared/locale/LocaleProvider'

export default function Home() {
  const { messages } = useLocale()
  return (
    <main>
      <section className={styles.introSection}>
        <h1 className={styles.title}>{messages.home.title}</h1>
        <p>{messages.home.intro}</p>
      </section>
      <section>
        <h2 className={styles.subTitle}>{messages.home.summaryHeading}</h2>
        <p>{messages.home.summary}</p>
      </section>
      <section className={styles.contactSection}>
        <h2 className={styles.subTitle}>{messages.home.contactHeading}</h2>
        <span className={styles.contactLinks}>
          <Link href="https://www.linkedin.com/in/lalrg/" className={styles.contactLink}>
            <TfiLinkedin className={styles.contactLinkIcon} />
          </Link>
          <Link href="https://twitter.com/luis0110" className={styles.contactLink}>
            <TfiTwitterAlt className={styles.contactLinkIcon} />
          </Link>
          <Link href="https://github.com/lalrg" className={styles.contactLink}>
            <TfiGithub className={styles.contactLinkIcon} />
          </Link>
        </span>
      </section>
    </main>
  )
}
