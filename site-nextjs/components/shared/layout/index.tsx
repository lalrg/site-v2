import React from 'react'
import Head from 'next/head'
import Header from './header';
import Footer from './footer';
import styles from './layout.module.css';

type LayoutProps = {
  children: React.ReactNode,
  className: string,
};

export default function Layout({ children, className }: LayoutProps) {
  return (
  <span className={className}>
    <Head>
      <title>Lalrg&apos;s site</title>
      <meta name="description" content="My profesional story, information to contact me, and some blog entries(coming soon)" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Header />
    <span className={styles.content}>
      {children}
    </span>
    <Footer />
  </span>)
}