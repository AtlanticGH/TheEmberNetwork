import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    '**/._*',
    'dist',
    'netlify/**',
    'archive-unused/**',
    // Vercel serverless functions (Node runtime)
    // Linted via explicit Node override below.
    // These directories are empty but can be non-readable on some Windows setups.
    // Ignoring them prevents ESLint from crashing during filesystem walking.
    'src/assets/**',
    'src/layouts/**',
    'src/legacy/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['api/**/*.js', 'lib/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      sourceType: 'commonjs',
    },
  },
])
