type SkillsToFilterProps = {
  allSkills: Array<string>;
  onChange: (x: Array<string>) => void; 
} 

const mapSkill = (skill: string) => {
  return (
    <div key={skill}>{skill}</div>
  )
}

const SkillsToFilter: React.FC<SkillsToFilterProps> = ({allSkills}) => {
  return(
    <>
      <h3>Filter working experiences by:</h3>
      {
        allSkills.map(s=>mapSkill(s))
      }
    </>
  )
}


export default SkillsToFilter;