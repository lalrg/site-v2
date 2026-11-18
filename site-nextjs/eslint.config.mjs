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
  {
    files: ['components/shared/locale/LocaleProvider.tsx'],
    rules: {
      // R3 forbids reading the cookie during render (it would desync hydration),
      // so the stored locale is read once in a mount effect and applied with
      // setState. That is the documented design, not derived-state syncing.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default eslintConfig
