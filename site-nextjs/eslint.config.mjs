import nextVitals from 'eslint-config-next/core-web-vitals'
import { globalIgnores } from 'eslint/config'

const eslintConfig = [
  ...nextVitals,
  globalIgnores(['.next/**', 'out/**', 'coverage/**', 'next-env.d.ts']),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]

export default eslintConfig
