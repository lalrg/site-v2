import styles from './skillsToFilter.module.css'
import { useLocale } from '../shared/locale/LocaleProvider'

type SkillsToFilterProps = {
  allSkills: Array<string>
  selectedSkills: Array<string>
  onChange: (x: Array<string>) => void
}

const mapSkill = (
  skill: string,
  selected: boolean,
  onClick: (item: string, selected: boolean) => void,
) => {
  return (
    <li
      className={`${styles.singleSkill} ${selected && styles.selected}`}
      onClick={() => onClick(skill, !selected)}
      key={skill}
    >
      {skill}
    </li>
  )
}

const SkillsToFilter: React.FC<SkillsToFilterProps> = ({ allSkills, selectedSkills, onChange }) => {
  const { messages } = useLocale()
  const onClick = (skill: string, selected: boolean) => {
    if (!selected) {
      onChange(selectedSkills.filter((x) => x !== skill))
    } else {
      onChange([...selectedSkills, skill])
    }
  }
  return (
    <>
      <h3 className={styles.subTitle}>{messages.skillsToFilter.heading}</h3>
      <div className={styles.filtersContainer}>
        <ul className={styles.skillList}>
          {allSkills.map((s) => mapSkill(s, selectedSkills.includes(s), onClick))}
        </ul>
      </div>
    </>
  )
}

export default SkillsToFilter
