import { useLocale } from '../components/shared/locale/LocaleProvider'

export default function Portfolio() {
  const { messages } = useLocale()
  return (
    <main>
      <h1>{messages.blog.placeholder}</h1>
    </main>
  )
}
