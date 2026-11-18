import React from 'react'
import styles from './whi.module.css'
import { useLocale } from '../../shared/locale/LocaleProvider'
import type { Locale } from '../../../lib/locale'

type WorkHistoryItemProps = {
  company: string
  position: Record<Locale, string>
  startDate: string
  endDate: string | null
  bulletPoints: Array<string>
  jobDescription: Record<Locale, string>
}

const WorkHistoryItem: React.FC<WorkHistoryItemProps> = ({
  company,
  position,
  startDate,
  endDate,
  bulletPoints,
  jobDescription,
}) => {
  const { locale, messages } = useLocale()
  const endDateValue = endDate === null ? messages.employmentHistory.stillWorkingHere : endDate

  return (
    <article className={styles.mainWHI}>
      <h2 className={styles.companyName}>{position[locale]}</h2>
      <p className="glow"> {company} </p>
      <p>
        {' '}
        {messages.employmentHistory.startDateLabel} {startDate} <br />{' '}
        {messages.employmentHistory.endDateLabel} {endDateValue}
      </p>
      <p>{jobDescription[locale]}</p>
      <div className={styles.techContainer}>
        {bulletPoints.map((bulletPoint) => (
          <span className={styles.techItem} key={bulletPoint}>
            {bulletPoint}
          </span>
        ))}
      </div>
    </article>
  )
}

export default WorkHistoryItem
