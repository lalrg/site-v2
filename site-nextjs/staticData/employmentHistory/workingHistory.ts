import type { Locale } from '../../lib/locale'

export type WorkHistoryEntry = {
  company: string
  position: Record<Locale, string>
  startDate: string
  endDate: string | null
  bulletPoints: Array<string>
  jobDescription: Record<Locale, string>
}

export const workingHistoryArray: Array<WorkHistoryEntry> = [
  {
    company: 'GreenSlate',
    position: {
      'en-GB': 'Senior Software Engineer',
      es: 'Ingeniero de Software Senior',
    },
    startDate: '2022-12-02',
    endDate: null,
    bulletPoints: ['Javascript', 'Typescript', '.Net', 'SQL Server', 'Microservices', 'CSS'],
    jobDescription: {
      'en-GB':
        'Maintaining, Supporting and developing new features in existing production software.',
      es: 'Mantenimiento, soporte y desarrollo de nuevas funcionalidades en software ya en producción.',
    },
  },
  {
    company: 'Gorilla Logic',
    position: {
      'en-GB': 'Senior Software Engineer',
      es: 'Ingeniero de Software Senior',
    },
    startDate: '2021-12-01',
    endDate: '2022-12-01',
    bulletPoints: [
      'Javascript',
      'Typescript',
      'Microservices',
      '.NetCore',
      'Azure',
      'SQL Server',
      'React',
    ],
    jobDescription: {
      'en-GB': 'I worked as a Senior consultant for multiple projecst with different tech stacks.',
      es: 'Trabajé como consultor senior en varios proyectos con stacks tecnológicos distintos.',
    },
  },
  {
    company: 'Growth Acceleration Partners',
    position: {
      'en-GB': 'Senior Software Engineer',
      es: 'Ingeniero de Software Senior',
    },
    startDate: '2019-07-01',
    endDate: '2021-11-01',
    bulletPoints: ['Javascript', 'Typescript', 'CSS', '.NetCore', 'AWS', 'Vue', 'React'],
    jobDescription: {
      'en-GB':
        'I worked as a consultant for multiple projects of different sizes and for companies in different fields from Financials to Open Source Software.',
      es: 'Trabajé como consultor en varios proyectos de distintos tamaños y para empresas de sectores muy diversos, desde finanzas hasta software de código abierto.',
    },
  },
  {
    company: 'Ernst&Young',
    position: {
      'en-GB': 'Software Engineer',
      es: 'Ingeniero de Software',
    },
    startDate: '2018-07-01',
    endDate: '2019-06-01',
    bulletPoints: ['Typescript', 'Vue', 'SQL Server', 'React', '.NetCore'],
    jobDescription: {
      'en-GB':
        'Full stack software development, some of my functions were: Developing and supporting existing and new products and tools, some of them already in production.',
      es: 'Desarrollo de software full stack. Algunas de mis funciones eran: desarrollar y dar soporte a productos y herramientas nuevos y existentes, algunos de ellos ya en producción.',
    },
  },
  {
    company: 'Datasoft Netsolutions',
    position: {
      'en-GB': 'Junior Software Engineer',
      es: 'Ingeniero de Software Junior',
    },
    startDate: '2016-07-01',
    endDate: '2018-06-01',
    bulletPoints: ['Javascript', '.Net', 'SQL Server'],
    jobDescription: {
      'en-GB':
        'I worked on multiple projects, some of my functions were: Project documentation, Creating new web apps, maintaining legacy code, Participating in client meetings.',
      es: 'Trabajé en varios proyectos. Algunas de mis funciones eran: documentar proyectos, crear nuevas aplicaciones web, mantener código heredado y participar en reuniones con clientes.',
    },
  },
]
