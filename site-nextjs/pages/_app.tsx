import type { AppProps } from 'next/app'
import Layout from '../components/shared/layout'
import '../styles/global.css'
import { Inconsolata } from '@next/font/google'

const inconsolata = Inconsolata({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return <Layout className={inconsolata.className}><Component {...pageProps} /></Layout>
}
