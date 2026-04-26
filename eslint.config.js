import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: [
      '.next/**',
      '**/.next/**',
      'node_modules/**',
      '**/node_modules/**',
      'dist/**',
      'coverage/**',
      'docs/archive/**',
      'smartkitchen/**',
      'agent-pnl/**',
      'agentnet/**',
      'al-futtaim/**',
      'data/**',
      'scripts/**',
      'tao/**',
      'weekend/**',
      'xrp/**',
      'app/api/portal/**',
      'app/components/common/**',
      'app/components/portal/**',
      'app/components/sections/**',
      'app/contexts/**',
      'app/kitchen-owner/**',
      'app/portal/**',
    ],
  },
  ...nextVitals,
]

export default config



