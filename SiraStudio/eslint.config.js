import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: [
      'src/store/applyPatch.ts',
      'src/store/dispatch.ts',
      'src/store/history.ts',
      'src/store/pathParser.ts',
      'src/store/sanitize.ts',
      'src/store/shallowEqual.ts',
      'src/store/store.ts',
      'src/store/types.ts',
      'src/store/__debug.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              message: 'Store core modules cannot import React runtime APIs.',
            },
            {
              name: 'react-dom',
              message: 'Store core modules cannot import React DOM APIs.',
            },
          ],
          patterns: [
            {
              group: ['react/*', 'react-dom/*'],
              message: 'Store core modules cannot import React runtime APIs.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/print/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@dnd-kit/core',
              message: 'Print modules cannot depend on drag-and-drop editor runtime.',
            },
            {
              name: '@dnd-kit/sortable',
              message: 'Print modules cannot depend on drag-and-drop editor runtime.',
            },
          ],
          patterns: [
            {
              group: [
                '../editor/*',
                '../editor/**',
                '../../editor/*',
                '../../editor/**',
                'src/editor/*',
                'src/editor/**',
              ],
              message: 'Print modules cannot import editor modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/editor/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
          message: 'Editor modules cannot use dangerouslySetInnerHTML.',
        },
      ],
    },
  },
])
