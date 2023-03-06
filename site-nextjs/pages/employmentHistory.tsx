import styles from '../pagesStyles/employmentHistory.module.css'
import WorkHistoryItem from '../components/employmentHistory/WorkHistoryItem'
import { workingHistoryArray } from '../staticData/employmentHistory/workingHistory'

export default function employmentHistory() {
  return (
    <main>
      <section className={styles.section}>
        <h1 className={styles.title}>Employment History </h1>
        <p>Companies I have worked with and the technology stacks I have used.</p>
      </section>
      <section className={styles.section}>
        <section className={`${styles.section} ${styles.employmentHistory}`}>
          {
            workingHistoryArray.map(
              i=> (
                <WorkHistoryItem 
                  jobDescription={i.jobDescription}
                  company={i.company}
                  startDate={i.startDate}
                  endDate={i.endDate}
                  position={i.position}
                  bulletPoints={i.bulletPoints}
                  key={i.company + i.endDate}
                />
              )
            )
          }
        </section>
      </section>
    </main>
  )
}