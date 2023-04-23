import React from 'react';
import styles from './whi.module.css'

interface WorkHistoryItemProps {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  bulletPoints: string[];
  jobDescription: string;
}

const WorkHistoryItem: React.FC<WorkHistoryItemProps> = ({
  company,
  position,
  startDate,
  endDate,
  bulletPoints,
  jobDescription
}) => {
  return (
    <article className={styles.mainWHI}>
      <h2 className={styles.companyName}>{position}</h2>
      <p className='glow'> {company} </p>
      <p> Start date: {startDate} <br/> End date: {endDate}</p>
      <p>
        {jobDescription}
      </p>
      <div className={styles.techContainer}>
        {bulletPoints.map((bulletPoint) => (
          <span 
            className={styles.techItem} 
            key={bulletPoint}>
              {bulletPoint}
            </span>
        ))}
      </div>
    </article>
  );
};

export default WorkHistoryItem;