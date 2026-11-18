import type { ReactNode } from 'react'

import { LOCALES, localeNames } from '../../../lib/locale'
import type { Locale } from '../../../lib/locale'
import { useLocale } from './LocaleProvider'
import SpanishFlag from './SpanishFlag'
import UnionJackFlag from './UnionJackFlag'
import styles from './LanguageSwitcher.module.css'

const flags: Record<Locale, ReactNode> = {
  'en-GB': <UnionJackFlag />,
  es: <SpanishFlag />,
}

const flagClasses: Record<Locale, string | undefined> = {
  'en-GB': styles.flag,
  es: `${styles.flag} ${styles.flagSpanish}`,
}

type LanguageSwitcherProps = {
  className: string | undefined
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, messages } = useLocale()
  const rootClassName =
    className === undefined ? styles.switcher : `${styles.switcher} ${className}`

  return (
    <div className={rootClassName} role="group" aria-label={messages.a11y.languageSwitcher}>
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          className={styles.button}
          aria-pressed={locale === item}
          onClick={() => setLocale(item)}
        >
          <span className={flagClasses[item]}>{flags[item]}</span>
          <span className={styles.visuallyHidden}>{localeNames[item]}</span>
        </button>
      ))}
    </div>
  )
}
