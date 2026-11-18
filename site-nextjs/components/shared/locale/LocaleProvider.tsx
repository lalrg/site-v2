import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { DEFAULT_LOCALE, parseLocaleCookie, serializeLocaleCookie } from '../../../lib/locale'
import type { Locale } from '../../../lib/locale'
import { translations } from '../../../staticData/i18n/translations'
import type { Dictionary } from '../../../staticData/i18n/en-GB'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: Dictionary
}

class LocaleContextError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LocaleContextError'
  }
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const readLocaleCookie = (): Locale => {
  try {
    return parseLocaleCookie(document.cookie)
  } catch {
    // Cookies blocked (hardened private mode): the default locale still renders, R2.
    return DEFAULT_LOCALE
  }
}

const writeLocaleCookie = (locale: Locale): void => {
  try {
    document.cookie = serializeLocaleCookie(locale)
  } catch {
    // Cookies blocked: the choice still holds for the life of the tab, R2.
  }
}

const syncDocumentLang = (locale: Locale): void => {
  if (document.documentElement.lang !== locale) {
    document.documentElement.lang = locale
  }
}

type LocaleProviderProps = {
  children: ReactNode
}

export default function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) {
        return
      }

      writeLocaleCookie(nextLocale)
      setLocaleState(nextLocale)
      syncDocumentLang(nextLocale)
    },
    [locale],
  )

  useEffect(() => {
    const storedLocale = readLocaleCookie()
    setLocaleState(storedLocale)
    syncDocumentLang(storedLocale)
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, messages: translations[locale] }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export const useLocale = (): LocaleContextValue => {
  const value = useContext(LocaleContext)

  if (value === null) {
    throw new LocaleContextError('useLocale must be used inside a LocaleProvider')
  }

  return value
}
