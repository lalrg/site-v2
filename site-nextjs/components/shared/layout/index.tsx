import React from 'react'
import Head from 'next/head'
import Header from './header';
import Footer from './footer';

type LayoutProps = {
  children: React.ReactNode,
};

export default function Layout({ children }: LayoutProps) {
  return <>
    <Head>
      <title>Lalrg&apos;s site</title>
      <meta name="description" content="My profesional story, information to contact me, and some blog entries(coming soon)" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Header />

    {children}

    <Footer />
  </>
}