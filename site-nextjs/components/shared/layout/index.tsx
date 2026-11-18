import React from 'react'
import Head from 'next/head'
import Header from './header'
import Footer from './footer'
import { useLocale } from '../locale/LocaleProvider'
import styles from './layout.module.css'

type LayoutProps = {
  children: React.ReactNode
  className: string
}

export default function Layout({ children, className }: LayoutProps) {
  const { messages } = useLocale()
  return (
    <span className={className}>
      <Head>
        <title>{messages.meta.title}</title>
        <meta name="description" content={messages.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />
      <span className={styles.content}>{children}</span>
      <Footer />
    </span>
  )
}
