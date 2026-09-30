import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'test-results',
    'playwright-report',
    'blob-report',
    'eddys-cafe-assets',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['*.config.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Design rules from docs/PLAN.md: raw values live only in src/styles/tokens.css.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...designRules()],
    },
  },
])

function designRules() {
  const pixelMessage = 'Use a spacing or size token instead of a pixel value.'
  const stringChecks = [
    {
      // Any hex colour in any string.
      pattern: '#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![0-9a-zA-Z_-])',
      message: 'Use a colour token (bg-ink, text-ink-muted, ...) instead of a hex value.',
    },
    {
      // Tailwind arbitrary values such as w-[44px] or p-[1.5px].
      pattern: '\\[[^\\]]*\\d(?:\\.\\d+)?px',
      message: pixelMessage,
    },
    {
      pattern: '(?:^|[\\s:])text-beige',
      message: 'beige and beige-dark are never used for text (docs/PLAN.md).',
    },
    {
      // Off-scale spacing (gap-10, p-5, ...) generates no CSS at all, silently.
      pattern:
        '(?:^|[\\s:])-?(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy]|[wh]|size|min-[wh]|max-[wh]|inset(?:-[xy])?|top|right|bottom|left|translate-[xy])-(?!(?:0|1|2|3|4|6|8|12|16|24|32|40)(?![0-9.]))[0-9]',
      message:
        'Not on the spacing scale (0 1 2 3 4 6 8 12 16 24 32 40): Tailwind generates nothing for it.',
    },
  ]
  return [
    ...stringChecks.flatMap(({ pattern, message }) => [
      { selector: `Literal[value=/${pattern}/]`, message },
      { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
    ]),
    // Inline styles: "12px" strings and bare numbers (React treats those as px).
    { selector: "JSXAttribute[name.name='style'] Literal[value=/\\dpx/]", message: pixelMessage },
    {
      selector: "JSXAttribute[name.name='style'] Property > Literal[raw=/^-?[1-9]/]",
      message: pixelMessage,
    },
  ]
}
