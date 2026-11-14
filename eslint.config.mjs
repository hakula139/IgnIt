import base from '@hakula139/eslint-config';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  base,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: globals.browser,
    },
  },
  {
    ignores: ['.claude/', 'example/public/'],
  },
]);
