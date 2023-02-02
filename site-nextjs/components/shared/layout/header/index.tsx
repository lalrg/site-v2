import Link from 'next/link'
import styles from './header.module.css'

const HeaderLink = (href: string, text: string) => {
  return <Link href={href} className='text-center text-lg'>{text}</Link>
}

export default function Header() {
  return (
    <header className='w-full bg-[#B4AEE8]'> &nbsp;
      <nav className={`grid grid-cols-4 items-center justify-center gap-4 ${styles.nav}`}>
        {HeaderLink("/", "Home")}
        {HeaderLink("/resume", "Resume")}
        {HeaderLink("/portfolio", "Portfolio")}
        {HeaderLink("/contact", "Contact")}
      </nav>
    </header>
  )
}
