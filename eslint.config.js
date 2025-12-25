import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

// ESLint v9 uses "flat config" by default. This project previously used .eslintrc.json.
// We keep the same ruleset by adapting the old extends via FlatCompat.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'coverage/**'],
  },
  ...compat.extends('next/core-web-vitals'),
]



