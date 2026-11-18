export type Locale = 'en-GB' | 'es'

export const LOCALES: ReadonlyArray<Locale> = ['en-GB', 'es']

export const DEFAULT_LOCALE: Locale = 'en-GB'

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'

const LOCALE_COOKIE_MAX_AGE_SECONDS = 31536000

export const localeNames: Record<Locale, string> = {
  'en-GB': 'English',
  es: 'Español',
}

export const isLocale = (value: string): value is Locale =>
  LOCALES.some((locale) => locale === value)

export const parseLocaleCookie = (cookieString: string): Locale => {
  const prefix = `${LOCALE_COOKIE_NAME}=`
  const entry = cookieString
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  if (entry === undefined) {
    return DEFAULT_LOCALE
  }

  const value = entry.slice(prefix.length)
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export const serializeLocaleCookie = (locale: Locale): string =>
  `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
