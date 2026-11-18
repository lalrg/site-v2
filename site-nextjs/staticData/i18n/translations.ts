import type { Locale } from '../../lib/locale'
import type { Dictionary } from './en-GB'
import { enGB } from './en-GB'
import { es } from './es'

export const translations: Record<Locale, Dictionary> = {
  'en-GB': enGB,
  es,
}
