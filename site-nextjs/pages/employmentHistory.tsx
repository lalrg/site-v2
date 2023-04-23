import styles from '../pagesStyles/employmentHistory.module.css'
import WorkHistoryItem from '../components/employmentHistory/WorkHistoryItem'
import { workingHistoryArray } from '../staticData/employmentHistory/workingHistory'
import React, { useMemo, useState } from 'react'
import SkillsToFilter from '../components/skillsToFilter'

const EmploymentHistory: React.FC = () => {
  const [skillsToFilter, setSkillsToFilter] = useState<Array<string>>([]);

  const allSkills = useMemo<Array<string>>(() => {
    let mappedSkills: Array<string> = [];
    workingHistoryArray.forEach(element => {
      mappedSkills = [...mappedSkills, ...element.bulletPoints];
    });

    return Array.from(new Set(mappedSkills));
  }, [])

  return (
    <main>
      <section className={styles.section}>
        <h1 className={styles.title}>Employment History </h1>
        <p>Companies I have worked with and the technology stacks I have used.</p>
      </section>
      <SkillsToFilter selectedSkills={skillsToFilter} onChange={(c) => { setSkillsToFilter(c) }} allSkills={allSkills} />
      <section className={`${styles.section} ${styles.employmentHistory}`}>
        {
          workingHistoryArray.map(
            i => {
              let display = false;
              i.bulletPoints.forEach(
                b => {
                  if (skillsToFilter.includes(b)) {
                    display = true;
                  }
                }
              )
              if (display || !skillsToFilter.length) {
                return (<WorkHistoryItem
                  jobDescription={i.jobDescription}
                  company={i.company}
                  startDate={i.startDate}
                  endDate={i.endDate}
                  position={i.position}
                  bulletPoints={i.bulletPoints}
                  key={i.company + i.endDate}
                />)
              }
            }
          )
        }
      </section>
    </main>
  )
}

export default EmploymentHistory;