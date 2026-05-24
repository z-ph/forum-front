import tailwind from 'eslint-plugin-tailwindcss'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// eslint-plugin-tailwindcss v3 flat/recommended:
//   [0] = { plugins, languageOptions } — register plugin
//   [1] = { rules } — enable rules
const [twPlugin, twRules] = tailwind.configs['flat/recommended']

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  twPlugin,
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        ecmaFeatures: { jsx: true },
      },
    },
    rules: twRules.rules,
    settings: {
      tailwindcss: {
        config: resolve(__dirname, 'src/style.css'),
      },
    },
  },
]
