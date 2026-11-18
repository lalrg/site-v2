import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

// The pre-paint script cannot import lib/locale.ts, so NEXT_LOCALE is duplicated
// here from LOCALE_COOKIE_NAME there. It runs before first paint and only ever
// assigns one of the two locale literals to <html lang>.
const prePaintLocaleScript = `(function () {
  try {
    var match = document.cookie.match(/(?:^|;\\s*)NEXT_LOCALE=([^;]*)/)
    var locale = match && match[1]
    if (locale === 'en-GB' || locale === 'es') {
      document.documentElement.lang = locale
    }
  } catch (error) {
    // document.cookie can be blocked; the static lang="en-GB" then stands.
  }
})()`

export default function Document() {
  return (
    <Html lang="en-GB">
      <Head>
        <link rel="icon" href="data:," />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script id="locale-lang" strategy="beforeInteractive">
          {prePaintLocaleScript}
        </Script>
      </body>
    </Html>
  )
}
