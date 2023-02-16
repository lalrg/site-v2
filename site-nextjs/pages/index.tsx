import styles from '../pagesStyles/index.module.css'
import { TfiGithub, TfiLinkedin, TfiTwitterAlt } from 'react-icons/tfi'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <section className={styles.introSection}>
        <h1 className={styles.title}>👋🏾 Nice to meet you, I am Luis</h1>
        <p>I am a problem-solver and enjoy helping people do their jobs more efficiently through the development of applications. I have been working in this field for about 7 years and have had the opportunity to work with a variety of companies, including the Government, small local business, and global companies with hundreds of employees. I have also worked as a consultant for several North American companies.</p>
      </section>
      <section>
        <h2 className={styles.subTitle}>Professional Summary</h2>
        <p>I have a strong background in software development, with a focus on using technologies such as React, JavaScript, TypeScript, SQL Server, .Net Core, and Python.</p>
      </section>
      <section className={styles.contactSection}>
        <h2 className={styles.subTitle}>Contact Information</h2>
        <span className={styles.contactLinks}>
          <Link href='/' className={styles.contactLink}>
            <TfiLinkedin className={styles.contactLinkIcon} />
          </Link>
          <Link href='/' className={styles.contactLink}>
            <TfiTwitterAlt className={styles.contactLinkIcon} />
          </Link>
          <Link href='/' className={styles.contactLink}>
            <TfiGithub className={styles.contactLinkIcon} />
          </Link>
        </span>
      </section>
    </main>
  )
}
